import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// REMOVED: import { SUBJECTS_DATA... } from '../data/subjects'; <-- This caused the dependency

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [subjects, setSubjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activities, setActivities] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      const isSeeded = await AsyncStorage.getItem("is_seeded");
      if (isSeeded !== "true") {
        await seedDatabase();
      }
      await loadData();
    } catch (error) {
      console.error("Failed to initialize database:", error);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    console.log("Seeding initial static data...");

    // Keep these if you want default Subjects/Videos before the backend loads
    // If you fetch EVERYTHING from backend, you can make these empty arrays []
    const initialSubjects = [
      { key: "mathematics", title: "Mathematics", icon: "calculator", color: "#FFC107" },
      { key: "chemistry", title: "Chemistry", icon: "flask", color: "#FF9800" },
      { key: "physics", title: "Physics", icon: "magnet", color: "#FF5722" },
      { key: "english", title: "English", icon: "book", color: "#8BC34A" },
    ];

    // Placeholder videos (You can remove these if fetching from backend)
    const initialVideos = [{ id: "math1", videoId: "UrECQM2zHPQ", title: "Mathematics Video 1", subject: "mathematics" }];

    // Placeholder activities
    const initialActivities = [];

    // NO QUESTIONS SEEDED (Since they come from backend)
    const initialQuestions = [];

    const multiSetPairs = [
      ["subjects", JSON.stringify(initialSubjects)],
      ["videos", JSON.stringify(initialVideos)],
      ["activities", JSON.stringify(initialActivities)],
      ["questions", JSON.stringify(initialQuestions)],
      ["is_seeded", "true"],
    ];

    await AsyncStorage.multiSet(multiSetPairs);
  };

  const loadData = async () => {
    const keys = ["subjects", "videos", "activities", "questions"];
    const result = await AsyncStorage.multiGet(keys);
    const data = {};
    result.forEach(([key, value]) => {
      data[key] = value ? JSON.parse(value) : [];
    });

    setSubjects(data.subjects);
    setVideos(data.videos);
    setActivities(data.activities);
    setQuestions(data.questions);
  };

  const syncOfflineData = async (apiClient, onProgress) => {
    try {
      console.log("[Sync] Starting offline sync...");
      // 1. Fetch all subjects/years metadata
      // We assume there's an endpoint or we try standard years.
      // Ideally backend has /questions/years-available
      // For now, let's just cache the subjects list first

      // Re-fetch subjects from server to ensure fresh list
      const subRes = await apiClient.get("/subjects");
      if (subRes.data) {
        await AsyncStorage.setItem("subjects", JSON.stringify(subRes.data));
        setSubjects(subRes.data);
      }

      // 2. Iterate and fetch questions
      // Fetching ALL might be too much. Let's aim for recent years or allow user to pick.
      // But per request "cache all questions".
      // We will fetch per subject-year to avoid timeouts.

      const subjectsToSync = subRes.data || subjects;
      const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

      let totalSteps = subjectsToSync.length * years.length;
      let currentStep = 0;

      for (const sub of subjectsToSync) {
        // We use s.id or s._id
        const subId = sub.id || sub._id;

        for (const year of years) {
          currentStep++;
          if (onProgress) onProgress(currentStep / totalSteps);

          try {
            const qRes = await apiClient.get("/questions", {
              subjectId: subId,
              year: year,
              limit: 100, // Get max per batch, maybe need pagination loop if > 100
              // If user has many questions per year, we might check meta.total
            });

            const questions = qRes.data?.data || [];
            if (questions.length > 0) {
              // Cache key: questions_{subId}_{year}
              const key = `questions_${subId}_${year}`;
              console.log(`[Sync] Caching ${questions.length} questions for ${sub.name} ${year}`);
              await AsyncStorage.setItem(key, JSON.stringify(questions));
            }
          } catch (e) {
            console.warn(`[Sync] Failed for ${sub.name} ${year}`, e.message);
          }
        }
      }

      console.log("[Sync] Completed.");
      return true;
    } catch (error) {
      console.error("[Sync] Error:", error);
      return false;
    }
  };

  // Helper to get questions from cache
  const getOfflineQuestions = async (subjectId, year) => {
    try {
      const key = `questions_${subjectId}_${year}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.err("Failed to load offline questions", e);
      return [];
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        subjects,
        videos,
        activities,
        questions,
        loading,
        syncOfflineData,
        getOfflineQuestions,
      }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
