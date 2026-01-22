import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  // Text styles with DM Sans
  text: {
    fontFamily: "DMSans-Regular",
  },
  textMedium: {
    fontFamily: "DMSans-Medium",
  },
  textSemiBold: {
    fontFamily: "DMSans-SemiBold",
  },
  textBold: {
    fontFamily: "DMSans-Bold",
  },
});

// Helper function to add font family to text styles
export const withFont = (style, weight = "regular") => {
  const fontMap = {
    regular: "DMSans-Regular",
    medium: "DMSans-Medium",
    semibold: "DMSans-SemiBold",
    bold: "DMSans-Bold",
  };

  return {
    ...style,
    fontFamily: fontMap[weight] || "DMSans-Regular",
  };
};
