
export const QUIZ_DATA = {
    "Mathematics": [
        {
            id: "math_1",
            questionText: "If 2x + 3y = 10 and x - y = 5, what is the value of x + y?",
            options: ["5", "3", "2", "7"],
            correctAnswer: "3",
            explanation: "Solving the system: x = 5 + y. Substitute into 2x+3y=10: 2(5+y)+3y=10 => 10+2y+3y=10 => 5y=0 => y=0. x=5. x+y=5."
        },
        {
            id: "math_2",
            questionText: "Evaluate integral of 2x dx from x=1 to x=2.",
            options: ["1", "2", "3", "4"],
            correctAnswer: "3",
            explanation: "Integral of 2x is x^2. [x^2] from 1 to 2 = 2^2 - 1^2 = 4 - 1 = 3."
        },
        {
            id: "math_3",
            questionText: "What is the probability of obtaining a sum of 4 when two fair dice are thrown?",
            options: ["1/12", "1/9", "1/6", "5/36"],
            correctAnswer: "1/12",
            explanation: "Possible outcomes for sum 4: (1,3), (2,2), (3,1) = 3 outcomes. Total outcomes = 36. Prob = 3/36 = 1/12."
        },
        {
            id: "math_4",
            questionText: "Make Q the subject of the formula P = M(Q + R).",
            options: ["Q = P/M + R", "Q = P/M - R", "Q = P - MR", "Q = P + MR"],
            correctAnswer: "Q = P/M - R",
            explanation: "P = MQ + MR => P - MR = MQ => Q = (P - MR)/M = P/M - R."
        },
        {
            id: "math_5",
            questionText: "Convert 1101 base 2 to base 10.",
            options: ["11", "13", "15", "12"],
            correctAnswer: "13",
            explanation: "1*2^3 + 1*2^2 + 0*2^1 + 1*2^0 = 8 + 4 + 0 + 1 = 13."
        },
        {
            id: "math_6",
            questionText: "If log10(x) = 2, what is x?",
            options: ["20", "100", "200", "10"],
            correctAnswer: "100",
            explanation: "log10(x)=2 implies x = 10^2 = 100."
        },
        {
            id: "math_7",
            questionText: "The gradient of the line 2y = 4x - 6 is:",
            options: ["2", "4", "-3", "-6"],
            correctAnswer: "2",
            explanation: "Rewrite as y = 2x - 3. Gradient (m) is 2."
        },
        {
            id: "math_8",
            questionText: "Calculate the simple interest on N20,000 for 2 years at 5% per annum.",
            options: ["N2000", "N1000", "N500", "N4000"],
            correctAnswer: "N2000",
            explanation: "SI = (P*R*T)/100 = (20000*5*2)/100 = 2000."
        },
        {
            id: "math_9",
            questionText: "A set containing no elements is called a(n):",
            options: ["Subset", "Universal set", "Finite set", "Null set"],
            correctAnswer: "Null set",
            explanation: "An empty set is also known as a null set."
        },
        {
            id: "math_10",
            questionText: "Factorize x^2 - 5x + 6.",
            options: ["(x-2)(x-3)", "(x+2)(x+3)", "(x-1)(x-6)", "(x+1)(x-6)"],
            correctAnswer: "(x-2)(x-3)",
            explanation: "Numbers multiplying to 6 and adding to -5 are -2 and -3."
        }
    ],
    "English": [
        {
            id: "eng_1",
            questionText: "Choose the option nearest in meaning to the underlined word: The chairman's reaction was 'innocuous'.",
            options: ["Dangerous", "Harmful", "Harmless", "Exciting"],
            correctAnswer: "Harmless",
            explanation: "Innocuous means not harmful or offensive."
        },
        {
            id: "eng_2",
            questionText: "Choose the correct spelling.",
            options: ["Embarasment", "Embarassment", "Embarrassment", "Embarrasment"],
            correctAnswer: "Embarrassment",
            explanation: "Correct spelling is double r and double s."
        },
        {
            id: "eng_3",
            questionText: "She has been here _____ 8 o'clock.",
            options: ["for", "since", "at", "by"],
            correctAnswer: "since",
            explanation: "Use 'since' with a specific point in time."
        },
        {
            id: "eng_4",
            questionText: "Choose the option opposite in meaning to 'Arrogant'.",
            options: ["Proud", "Humble", "Stupid", "Timid"],
            correctAnswer: "Humble",
            explanation: "Arrogant means having an exaggerated sense of one's own importance. Humble is the opposite."
        },
        {
            id: "eng_5",
            questionText: "The boy, along with his parents, _____ going to the party.",
            options: ["is", "are", "were", "have"],
            correctAnswer: "is",
            explanation: "The subject 'The boy' is singular, so the verb must be singular ('is'). 'along with his parents' is parenthetical."
        },
        {
            id: "eng_6",
            questionText: "Choose the option that best completes: The police _____ looking for the suspect.",
            options: ["is", "are", "was", "has"],
            correctAnswer: "are",
            explanation: "'Police' is a plural noun in English, so it takes a plural verb."
        },
        {
            id: "eng_7",
            questionText: "From the options, pick the word with a different vowel sound from 'Peak'.",
            options: ["Seat", "Weak", "Break", "Meat"],
            correctAnswer: "Break",
            explanation: "'Break' has the /eɪ/ sound, while others have /i:/."
        },
        {
            id: "eng_8",
            questionText: "Idiom: To 'let the cat out of the bag' means:",
            options: ["To release a pet", "To reveal a secret", "To buy a cat", "To be careless"],
            correctAnswer: "To reveal a secret",
            explanation: "It means to disclose a secret, often inadvertently."
        },
        {
            id: "eng_9",
            questionText: "He is the _____ of the two brothers.",
            options: ["tallest", "taller", "most tall", "more tall"],
            correctAnswer: "taller",
            explanation: "Use the comparative 'taller' when comparing two people."
        },
        {
            id: "eng_10",
            questionText: "Choose the correct option: Neither of the boys _____ present.",
            options: ["were", "are", "have been", "was"],
            correctAnswer: "was",
            explanation: "'Neither' is treated as singular, so 'was' is correct."
        }
    ],
    "Physics": [
        {
            id: "phy_1",
            questionText: "Which of the following is a scalar quantity?",
            options: ["Velocity", "Displacement", "Force", "Speed"],
            correctAnswer: "Speed",
            explanation: "Speed has magnitude but no direction."
        },
        {
            id: "phy_2",
            questionText: "A body starts from rest and accelerates uniformly at 5m/s² for 4s. Calculate the distance covered.",
            options: ["20m", "40m", "80m", "100m"],
            correctAnswer: "40m",
            explanation: "s = ut + 0.5at². u=0. s = 0.5 * 5 * 4² = 0.5 * 5 * 16 = 40m."
        },
        {
            id: "phy_3",
            questionText: "The SI unit of power is:",
            options: ["Joule", "Watt", "Newton", "Pascal"],
            correctAnswer: "Watt",
            explanation: "Power is measured in Watts (Joules per second)."
        },
        {
            id: "phy_4",
            questionText: "Which instrument is used to measure atmospheric pressure?",
            options: ["Thermometer", "Barometer", "Hygrometer", "Manometer"],
            correctAnswer: "Barometer",
            explanation: "A barometer is used to measure atmospheric pressure."
        },
        {
            id: "phy_5",
            questionText: "Sound waves cannot travel through:",
            options: ["Solids", "Liquids", "Gases", "Vacuum"],
            correctAnswer: "Vacuum",
            explanation: "Sound waves are mechanical waves and require a medium to propagate."
        },
        {
            id: "phy_6",
            questionText: "A convex mirror always produces an image that is:",
            options: ["Real and inverted", "Virtual and erect", "Real and magnified", "Virtual and inverted"],
            correctAnswer: "Virtual and erect",
            explanation: "Convex mirrors always form virtual, erect, and diminished images."
        },
        {
            id: "phy_7",
            questionText: "Energy stored in a capacitor is given by:",
            options: ["0.5 CV", "0.5 CV^2", "CV^2", "CV"],
            correctAnswer: "0.5 CV^2",
            explanation: "Energy E = 1/2 CV^2."
        },
        {
            id: "phy_8",
            questionText: "The phenomenon where light bends as it passes from one medium to another is:",
            options: ["Reflection", "Refraction", "Diffraction", "Interference"],
            correctAnswer: "Refraction",
            explanation: "Refraction is the change in direction of a wave passing from one medium to another."
        },
        {
            id: "phy_9",
            questionText: "Which radiation has the highest penetration power?",
            options: ["Alpha", "Beta", "Gamma", "X-rays"],
            correctAnswer: "Gamma",
            explanation: "Gamma rays are high energy photons with the highest penetration power."
        },
        {
            id: "phy_10",
            questionText: "Calculate the work done by a force of 10N moving an object 5m.",
            options: ["2J", "15J", "50J", "500J"],
            correctAnswer: "50J",
            explanation: "Work = Force x Distance = 10N * 5m = 50J."
        }
    ],
    "Chemistry": [
        {
            id: "chem_1",
            questionText: "The nucleus of an atom contains:",
            options: ["Protons and Electrons", "Neutrons and Electrons", "Protons and Neutrons", "Protons only"],
            correctAnswer: "Protons and Neutrons",
            explanation: "The nucleus is the central part containing protons and neutrons."
        },
        {
            id: "chem_2",
            questionText: "Which gas is evolved when calcium trioxocarbonate(IV) reacts with dilute hydrochloric acid?",
            options: ["Hydrogen", "Oxygen", "Carbon(IV)oxide", "Chlorine"],
            correctAnswer: "Carbon(IV)oxide",
            explanation: "CaCO3 + 2HCl -> CaCl2 + H2O + CO2."
        },
        {
            id: "chem_3",
            questionText: "Organic Chemistry is the study of compounds of:",
            options: ["Carbon", "Oxygen", "Nitrogen", "Hydrogen"],
            correctAnswer: "Carbon",
            explanation: "Organic chemistry is specifically the study of carbon compounds."
        },
        {
            id: "chem_4",
            questionText: "An element X has electron configuration 2, 8, 2. It belongs to which group?",
            options: ["Group 1", "Group 2", "Group 3", "Group 8"],
            correctAnswer: "Group 2",
            explanation: "It has 2 valence electrons, so it belongs to Group 2."
        },
        {
            id: "chem_5",
            questionText: "Which of the following is an Acidic Oxide?",
            options: ["Na2O", "CaO", "SO2", "CO"],
            correctAnswer: "SO2",
            explanation: "Non-metal oxides like SO2 are typically acidic."
        },
        {
            id: "chem_6",
            questionText: "The pH of a neutral solution at 25°C is:",
            options: ["0", "14", "7", "1"],
            correctAnswer: "7",
            explanation: "Neutral pH is 7."
        },
        {
            id: "chem_7",
            questionText: "Isotopes are atoms of the same element with different:",
            options: ["Atomic numbers", "Mass numbers", "Electron numbers", "Proton numbers"],
            correctAnswer: "Mass numbers",
            explanation: "Isotopes have same protons (atomic no) but different neutrons (mass no)."
        },
        {
            id: "chem_8",
            questionText: "Alkanes have the general formula:",
            options: ["CnH2n", "CnH2n+2", "CnH2n-2", "CnH2n+1"],
            correctAnswer: "CnH2n+2",
            explanation: "Alkanes are saturated hydrocarbons with formula CnH2n+2."
        },
        {
            id: "chem_9",
            questionText: "The process of coating iron with zinc to prevent rusting is:",
            options: ["Tinning", "Electroplating", "Galvanizing", "Alloying"],
            correctAnswer: "Galvanizing",
            explanation: "Galvanizing is applying a protective zinc coating to steel or iron."
        },
        {
            id: "chem_10",
            questionText: "Which of these is a noble gas?",
            options: ["Oxygen", "Nitrogen", "Argon", "Chlorine"],
            correctAnswer: "Argon",
            explanation: "Argon is a Group 8 (Noble) gas."
        }
    ],
    "Biology": [
        {
            id: "bio_1",
            questionText: "The basic unit of life is:",
            options: ["Tissue", "Organ", "Cell", "System"],
            correctAnswer: "Cell",
            explanation: "The cell is the structural and functional unit of all living organisms."
        },
        {
            id: "bio_2",
            questionText: "Which of the following contains deoxygenated blood?",
            options: ["Aorta", "Pulmonary Vein", "Pulmonary Artery", "Carotid Artery"],
            correctAnswer: "Pulmonary Artery",
            explanation: "The pulmonary artery carries deoxygenated blood from the heart to the lungs."
        },
        {
            id: "bio_3",
            questionText: "Photosynthesis takes place in the:",
            options: ["Mitochondria", "Ribosome", "Chloroplast", "Nucleus"],
            correctAnswer: "Chloroplast",
            explanation: "Chloroplasts contain chlorophyll which is essential for photosynthesis."
        },
        {
            id: "bio_4",
            questionText: "Deficiency of Vitamin C causes:",
            options: ["Rickets", "Beriberi", "Scurvy", "Night blindness"],
            correctAnswer: "Scurvy",
            explanation: "Scurvy is caused by a lack of vitamin C."
        },
        {
            id: "bio_5",
            questionText: "Which part of the brain controls balance and posture?",
            options: ["Cerebrum", "Cerebellum", "Medulla Oblongata", "Thalamus"],
            correctAnswer: "Cerebellum",
            explanation: "The cerebellum is responsible for coordination, balance, and posture."
        },
        {
            id: "bio_6",
            questionText: "Which of the following is NOT a characteristic of living things?",
            options: ["Respiration", "Reproduction", "Stagnation", "Excretion"],
            correctAnswer: "Stagnation",
            explanation: "Living things move, they do not stagnate (MR NIGER D)."
        },
        {
            id: "bio_7",
            questionText: "The mammalian heart has how many chambers?",
            options: ["2", "3", "4", "5"],
            correctAnswer: "4",
            explanation: "The mammalian heart has 4 chambers (2 atria, 2 ventricles)."
        },
        {
            id: "bio_8",
            questionText: "Osmosis involves the movement of:",
            options: ["Solutes", "Water molecules", "Gas", "Ions"],
            correctAnswer: "Water molecules",
            explanation: "Osmosis is the movement of water molecules through a semi-permeable membrane."
        },
        {
            id: "bio_9",
            questionText: "Which blood group is the universal donor?",
            options: ["A", "B", "AB", "O"],
            correctAnswer: "O",
            explanation: "Blood group O is the universal donor."
        },
        {
            id: "bio_10",
            questionText: "Ecology is the study of:",
            options: ["Cells", "Environment", "Organisms and their environment", "Genes"],
            correctAnswer: "Organisms and their environment",
            explanation: "Ecology studies the interactions between organisms and their environment."
        }
    ],

    "Economics": [
        {
            id: "econ_1",
            questionText: "The basic economic problem is:",
            options: ["Inflation", "Unemployment", "Scarcity", "Poverty"],
            correctAnswer: "Scarcity",
            explanation: "Scarcity of resources relative to unlimited wants is the fundamental economic problem."
        },
        {
            id: "econ_2",
            questionText: "Human wants are said to be:",
            options: ["Limited", "Insatiable", "Scarce", "Few"],
            correctAnswer: "Insatiable",
            explanation: "Human wants are unlimited or insatiable."
        },
        {
            id: "econ_3",
            questionText: "A market with a single seller is called:",
            options: ["Duopoly", "Monopoly", "Oligopoly", "Perfect Competition"],
            correctAnswer: "Monopoly",
            explanation: "A monopoly exists when there is only one supplier of a good or service."
        },
        {
            id: "econ_4",
            questionText: "The reward for land as a factor of production is:",
            options: ["Wages", "Interest", "Rent", "Profit"],
            correctAnswer: "Rent",
            explanation: "Land earns rent, labor earns wages, capital earns interest, entrepreneur earns profit."
        },
        {
            id: "econ_5",
            questionText: "Which of the following is NOT a function of money?",
            options: ["Medium of exchange", "Store of value", "Measure of value", "Double coincidence of wants"],
            correctAnswer: "Double coincidence of wants",
            explanation: "Double coincidence of wants is a problem of barter, not a function of money."
        },
        {
            id: "econ_6",
            questionText: "Demand curve generally slopes:",
            options: ["Upward", "Downward", "Horizontally", "Vertically"],
            correctAnswer: "Downward",
            explanation: "The demand curve slopes downward from left to right."
        },
        {
            id: "econ_7",
            questionText: "Scale of preference is a list of wants arranged in order of:",
            options: ["Price", "Importance", "Quantity", "Availability"],
            correctAnswer: "Importance",
            explanation: "A scale of preference ranks wants by priority."
        },
        {
            id: "econ_8",
            questionText: "Which organization is responsible for monetary policy in Nigeria?",
            options: ["NNPC", "CBN", "FIRS", "FRSC"],
            correctAnswer: "CBN",
            explanation: "The Central Bank of Nigeria (CBN) manages monetary policy."
        },
        {
            id: "econ_9",
            questionText: "Opportunity cost is defined as:",
            options: ["Money cost", "Alternative foregone", "Fixed cost", "Variable cost"],
            correctAnswer: "Alternative foregone",
            explanation: "Opportunity cost is the next best alternative that is sacrificed."
        },
        {
            id: "econ_10",
            questionText: "Inflation is defined as a persistent rise in:",
            options: ["Wages", "General price level", "Production", "Population"],
            correctAnswer: "General price level",
            explanation: "Inflation is a sustained increase in the general price level of goods and services."
        }
    ],

    "Government": [
        {
            id: "govt_1",
            questionText: "The first military head of state in Nigeria was:",
            options: ["Yakubu Gowon", "Murtala Muhammed", "Aguiyi Ironsi", "Olusegun Obasanjo"],
            correctAnswer: "Aguiyi Ironsi",
            explanation: "Major General Aguiyi Ironsi became the first military Head of State in 1966."
        },
        {
            id: "govt_2",
            questionText: "Democracy is best defined as government of the people, by the people, and for the:",
            options: ["Leaders", "Rich", "People", "Military"],
            correctAnswer: "People",
            explanation: "This is Abraham Lincoln's famous definition of democracy."
        },
        {
            id: "govt_3",
            questionText: "The Rule of Law implies:",
            options: ["Supremacy of the law", "Supremacy of the President", "Military rule", "Immunity for leaders"],
            correctAnswer: "Supremacy of the law",
            explanation: "Rule of Law means the law is supreme and applies to everyone equally."
        },
        {
            id: "govt_4",
            questionText: "Nigeria became a republic in:",
            options: ["1960", "1963", "1979", "1999"],
            correctAnswer: "1963",
            explanation: "Nigeria became a Federal Republic on October 1, 1963."
        },
        {
            id: "govt_5",
            questionText: "The arm of government responsible for making laws is the:",
            options: ["Executive", "Judiciary", "Legislature", "Police"],
            correctAnswer: "Legislature",
            explanation: "The Legislature (parliament/assembly) is responsible for law-making."
        },
        {
            id: "govt_6",
            questionText: "A constitution that is difficult to amend is called:",
            options: ["Flexible", "Rigid", "Written", "Unwritten"],
            correctAnswer: "Rigid",
            explanation: "A rigid constitution requires a special process for amendment."
        },
        {
            id: "govt_7",
            questionText: "The head of the Commonwealth of Nations is the:",
            options: ["British Monarch", "US President", "UN Secretary General", "Nigerian President"],
            correctAnswer: "British Monarch",
            explanation: "The British Monarch is the symbolic head of the Commonwealth."
        },
        {
            id: "govt_8",
            questionText: "Franchise in government refers to:",
            options: ["French people", "Right to vote", "Business license", "Foreign aid"],
            correctAnswer: "Right to vote",
            explanation: "Franchise or suffrage is the right to vote in public elections."
        },
        {
            id: "govt_9",
            questionText: "ECOWAS headquarters is located in:",
            options: ["Accra", "Lagos", "Abuja", "Lome"],
            correctAnswer: "Abuja",
            explanation: "The headquarters of ECOWAS is in Abuja, Nigeria."
        },
        {
            id: "govt_10",
            questionText: "Bicameral legislature means:",
            options: ["Two chambers", "One chamber", "Military rule", "No legislature"],
            correctAnswer: "Two chambers",
            explanation: "Bicameralism means having two legislative chambers (e.g., Senate and House of Reps)."
        }
    ],

    "Commerce": [
        {
            id: "comm_1",
            questionText: "Production ends when goods reach the:",
            options: ["Wholesaler", "Retailer", "Consumer", "Warehouse"],
            correctAnswer: "Consumer",
            explanation: "Production is complete only when the goods or services reach the final consumer."
        },
        {
            id: "comm_2",
            questionText: "A sole trader is responsible for:",
            options: ["Limited debts", "Unlimited debts", "Shareholders' debts", "Government debts"],
            correctAnswer: "Unlimited debts",
            explanation: "A sole trader has unlimited liability."
        },
        {
            id: "comm_3",
            questionText: "Which of the following is an aid to trade?",
            options: ["Farming", "Mining", "Banking", "Manufacturing"],
            correctAnswer: "Banking",
            explanation: "Banking, Insurance, Transport, etc., are aids to trade (commercial services)."
        },
        {
            id: "comm_4",
            questionText: "The document that shows the details of goods sold is:",
            options: ["Receipt", "Invoice", "Order", "Quotation"],
            correctAnswer: "Invoice",
            explanation: "An invoice details the goods sold and the amount due."
        },
        {
            id: "comm_5",
            questionText: "International trade is trade between:",
            options: ["Cities", "States", "Companies", "Countries"],
            correctAnswer: "Countries",
            explanation: "International trade occurs across national borders."
        },
        {
            id: "comm_6",
            questionText: "A public limited company is owned by:",
            options: ["Government", "Shareholders", "Employees", "Directors"],
            correctAnswer: "Shareholders",
            explanation: "Public limited companies are owned by shareholders."
        },
        {
            id: "comm_7",
            questionText: "Which mode of transport is best for bulky goods over long distances?",
            options: ["Air", "Road", "Rail", "Pipeline"],
            correctAnswer: "Rail",
            explanation: "Rail transport is most suitable and economical for bulky goods over land."
        },
        {
            id: "comm_8",
            questionText: "Advertising aimed at persuasion is:",
            options: ["Informative", "Persuasive", "Competitive", "Generic"],
            correctAnswer: "Persuasive",
            explanation: "Persuasive advertising tries to convince customers to buy a specific brand."
        },
        {
            id: "comm_9",
            questionText: "The place where stocks and shares are bought and sold is:",
            options: ["Money market", "Stock exchange", "Commodity market", "Supermarket"],
            correctAnswer: "Stock exchange",
            explanation: "The Stock Exchange is the market for securities."
        },
        {
            id: "comm_10",
            questionText: "Which is the fastest means of communication?",
            options: ["Post", "Telephone", "Messenger", "Smoke"],
            correctAnswer: "Telephone",
            explanation: "Telephone/Internet is the fastest means of communication."
        }
    ],

    "CRK": [
        {
            id: "crk_1",
            questionText: "Who was the father of John the Baptist?",
            options: ["Joseph", "Zachariah", "Simon", "Peter"],
            correctAnswer: "Zachariah",
            explanation: "Zachariah was the father of John the Baptist (Luke 1)."
        },
        {
            id: "crk_2",
            questionText: "The first miracle of Jesus was performed at:",
            options: ["Jericho", "Capernaum", "Cana", "Nazareth"],
            correctAnswer: "Cana",
            explanation: "Turning water into wine at the wedding in Cana (John 2)."
        },
        {
            id: "crk_3",
            questionText: "Who betrayed Jesus?",
            options: ["Peter", "Judas Iscariot", "Thomas", "James"],
            correctAnswer: "Judas Iscariot",
            explanation: "Judas Iscariot betrayed Jesus for 30 pieces of silver."
        },
        {
            id: "crk_4",
            questionText: "God created the world in how many days?",
            options: ["5", "6", "7", "40"],
            correctAnswer: "6",
            explanation: "God created the world in 6 days and rested on the 7th."
        },
        {
            id: "crk_5",
            questionText: "The Israelites crossed the Red Sea under the leadership of:",
            options: ["Joshua", "Aaron", "Moses", "David"],
            correctAnswer: "Moses",
            explanation: "Moses led the Israelites out of Egypt and across the Red Sea."
        },
        {
            id: "crk_6",
            questionText: "Who was the mother of Samuel?",
            options: ["Sarah", "Hannah", "Elizabeth", "Ruth"],
            correctAnswer: "Hannah",
            explanation: "Hannah prayed for a child and gave birth to Samuel."
        },
        {
            id: "crk_7",
            questionText: "David killed Goliath using:",
            options: ["Sword", "Spear", "Sling and stone", "Arrow"],
            correctAnswer: "Sling and stone",
            explanation: "David used a sling and a stone to defeat Goliath."
        },
        {
            id: "crk_8",
            questionText: "Who was thrown into the lions' den?",
            options: ["Joseph", "Daniel", "Shadrach", "Elijah"],
            correctAnswer: "Daniel",
            explanation: "Daniel was thrown into the lions' den for praying to God."
        },
        {
            id: "crk_9",
            questionText: "The parable of the Prodigal Son teaches about:",
            options: ["Greed", "Forgiveness", "Hard work", "Farming"],
            correctAnswer: "Forgiveness",
            explanation: "It illustrates God's forgiveness for repentant sinners."
        },
        {
            id: "crk_10",
            questionText: "Who denied Jesus three times?",
            options: ["Judas", "Peter", "John", "Matthew"],
            correctAnswer: "Peter",
            explanation: "Peter denied knowing Jesus three times before the rooster crowed."
        }
    ],

    "Literature": [
        {
            id: "lit_1",
            questionText: "A poem of fourteen lines is called a:",
            options: ["Ballad", "Sonnet", "Ode", "Elegy"],
            correctAnswer: "Sonnet",
            explanation: "A sonnet is a fixed verse form of Italian origin consisting of 14 lines."
        },
        {
            id: "lit_2",
            questionText: "The central idea or message of a literary work is the:",
            options: ["Plot", "Setting", "Theme", "Style"],
            correctAnswer: "Theme",
            explanation: "Theme is the main subject or underlying meaning."
        },
        {
            id: "lit_3",
            questionText: "'The sun smiled down on us' is an example of:",
            options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
            correctAnswer: "Personification",
            explanation: "Giving human qualities (smiling) to an inanimate object (sun)."
        },
        {
            id: "lit_4",
            questionText: "A play ends happily is usually a:",
            options: ["Tragedy", "Comedy", "Farce", "Melodrama"],
            correctAnswer: "Comedy",
            explanation: "Comedies traditionally end happily, often with a marriage."
        },
        {
            id: "lit_5",
            questionText: "Who wrote 'Things Fall Apart'?",
            options: ["Wole Soyinka", "Chinua Achebe", "Cyprian Ekwensi", "Chimamanda Adichie"],
            correctAnswer: "Chinua Achebe",
            explanation: "Chinua Achebe is the author of Things Fall Apart."
        },
        {
            id: "lit_6",
            questionText: "A speech made by a character alone on stage is:",
            options: ["Dialogue", "Monologue", "Soliloquy", "Aside"],
            correctAnswer: "Soliloquy",
            explanation: "A soliloquy is a device used in drama to express a character's thoughts aloud."
        },
        {
            id: "lit_7",
            questionText: "'As white as snow' is an example of:",
            options: ["Metaphor", "Simile", "Irony", "Paradox"],
            correctAnswer: "Simile",
            explanation: "A simile compares two things using 'like' or 'as'."
        },
        {
            id: "lit_8",
            questionText: "The antagonist is:",
            options: ["The hero", " The villain/opponent", "The narrator", "The author"],
            correctAnswer: " The villain/opponent",
            explanation: "The antagonist opposes the main character (protagonist)."
        },
        {
            id: "lit_9",
            questionText: "Which genre involves imaginary worlds and magic?",
            options: ["Science Fiction", "Fantasy", "Realism", "Biography"],
            correctAnswer: "Fantasy",
            explanation: "Fantasy is characterized by magic and supernatural elements."
        },
        {
            id: "lit_10",
            questionText: "The time and place of a story is the:",
            options: ["Setting", "Plot", "Conflict", "Tone"],
            correctAnswer: "Setting",
            explanation: "Setting refers to the location and time period in which a story takes place."
        }
    ]
};
