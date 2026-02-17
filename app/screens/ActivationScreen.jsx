import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Platform,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";

import {
    PurchaseError,
    requestSubscription,
    useIAP,
    validateReceiptIos,
} from "react-native-iap";

// 👉 NOTE: Changed to import your specific Apple shared secret
import { APPLE_PAY_SECRET } from "@env";

const errorLog = ({ message, error }) => {
    console.error("An error happened", message, error);
};

const isIos = Platform.OS === "ios";

// 👉 NOTE: Replace "cwgmonthly299" with your actual App Store Connect Product ID if it's different for this screen
const subscriptionSkus = Platform.select({
    ios: ["cwgmonthly299"],
});

// 👉 NOTE: Renamed the component to ActivationScreen
export const ActivationScreen = ({ navigation }) => {
    const {
        connected,
        subscriptions,
        getSubscriptions,
        currentPurchase,
        finishTransaction,
        purchaseHistory,
        getPurchaseHistory,
    } = useIAP();

    const [loading, setLoading] = useState(false);

    const handleGetPurchaseHistory = async () => {
        try {
            await getPurchaseHistory();
        } catch (error) {
            errorLog({ message: "handleGetPurchaseHistory", error });
        }
    };

    useEffect(() => {
        handleGetPurchaseHistory();
    }, [connected]);

    const handleGetSubscriptions = async () => {
        try {
            await getSubscriptions({ skus: subscriptionSkus });
        } catch (error) {
            errorLog({ message: "handleGetSubscriptions", error });
        }
    };

    useEffect(() => {
        handleGetSubscriptions();
    }, [connected]);

    useEffect(() => {
        // Navigate home if they already own the subscription
        if (
            purchaseHistory.find(
                (x) => x.productId === (subscriptionSkus[0] || subscriptionSkus[1]),
            )
        ) {
            navigation.navigate("Home");
        }
    }, [connected, purchaseHistory, subscriptions]);

    const handleBuySubscription = async (productId) => {
        try {
            await requestSubscription({
                sku: productId,
            });
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error instanceof PurchaseError) {
                errorLog({ message: `[${error.code}]: ${error.message}`, error });
            } else {
                errorLog({ message: "handleBuySubscription", error });
            }
        }
    };

    useEffect(() => {
        const checkCurrentPurchase = async (purchase) => {
            if (purchase) {
                try {
                    const receipt = purchase.transactionReceipt;
                    if (receipt) {
                        if (Platform.OS === "ios") {
                            const isTestEnvironment = __DEV__;

                            // 👉 NOTE: Updated this section to use your APPLE_PAY_SECRET
                            const appleReceiptResponse = await validateReceiptIos(
                                {
                                    "receipt-data": receipt,
                                    password: APPLE_PAY_SECRET,
                                },
                                isTestEnvironment,
                            );

                            // If receipt is valid, activate the app and navigate
                            if (appleReceiptResponse) {
                                const { status } = appleReceiptResponse;
                                if (status === 0) { // status 0 usually means success for Apple receipts
                                    navigation.navigate("Home");
                                }
                            }

                            // Tell the store the transaction is completely finished
                            await finishTransaction({ purchase, isConsumable: false });
                            return;
                        }
                    }
                } catch (error) {
                    console.log("error", error);
                }
            }
        };
        checkCurrentPurchase(currentPurchase);
    }, [currentPurchase, finishTransaction]);

    return (
        <SafeAreaView>
            <ScrollView>
                <View style={{ padding: 10 }}>
                    <Text
                        style={{
                            fontSize: 28,
                            textAlign: "center",
                            paddingBottom: 15,
                            color: "black",
                            fontWeight: "bold",
                        }}
                    >
                        Activate App
                    </Text>
                    <Text style={styles.listItem}>
                        Subscribe to unlock full access.
                    </Text>
                    <Text
                        style={[
                            styles.listItem,
                            {
                                fontWeight: "500",
                                textAlign: "center",
                                marginTop: 10,
                                fontSize: 18,
                            }
                        ]}
                    >
                        Choose your membership plan.
                    </Text>
                    <View style={{ marginTop: 10 }}>
                        {subscriptions.map((subscription, index) => {
                            const owned = purchaseHistory.find(
                                (s) => s?.productId === subscription.productId,
                            );

                            return (
                                <View style={styles.box} key={index}>
                                    {subscription?.introductoryPriceSubscriptionPeriodIOS && (
                                        <Text style={styles.specialTag}>SPECIAL OFFER</Text>
                                    )}
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginTop: 10,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                paddingBottom: 10,
                                                fontWeight: "bold",
                                                fontSize: 18,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {subscription?.title}
                                        </Text>
                                        <Text
                                            style={{
                                                paddingBottom: 20,
                                                fontWeight: "bold",
                                                fontSize: 18,
                                            }}
                                        >
                                            {subscription?.localizedPrice}
                                        </Text>
                                    </View>
                                    {subscription?.introductoryPriceSubscriptionPeriodIOS && (
                                        <Text>
                                            Free for 1{" "}
                                            {subscription?.introductoryPriceSubscriptionPeriodIOS}
                                        </Text>
                                    )}
                                    <Text style={{ paddingBottom: 20 }}>
                                        {subscription?.description}
                                    </Text>
                                    {owned && (
                                        <Text style={{ textAlign: "center", marginBottom: 10 }}>
                                            App is Activated!
                                        </Text>
                                    )}
                                    {owned && (
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: "#0071bc" }]}
                                            onPress={() => {
                                                navigation.navigate("Home");
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Continue to App</Text>
                                        </TouchableOpacity>
                                    )}
                                    {loading && <ActivityIndicator size="large" />}
                                    {!loading && !owned && isIos && (
                                        <TouchableOpacity
                                            style={styles.button}
                                            onPress={() => {
                                                setLoading(true);
                                                handleBuySubscription(subscription.productId);
                                            }}
                                        >
                                            <Text style={styles.buttonText}>Subscribe & Activate</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    listItem: {
        fontSize: 16,
        paddingLeft: 8,
        paddingBottom: 3,
        textAlign: "center",
        color: "black",
    },
    box: {
        margin: 10,
        marginBottom: 5,
        padding: 10,
        backgroundColor: "white",
        borderRadius: 7,
        shadowColor: "rgba(0, 0, 0, 0.45)",
        shadowOffset: { height: 16, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    button: {
        alignItems: "center",
        backgroundColor: "mediumseagreen",
        borderRadius: 8,
        padding: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        textTransform: "uppercase",
    },
    specialTag: {
        color: "white",
        backgroundColor: "crimson",
        width: 125,
        padding: 4,
        fontWeight: "bold",
        fontSize: 12,
        borderRadius: 7,
        marginBottom: 2,
    },
});