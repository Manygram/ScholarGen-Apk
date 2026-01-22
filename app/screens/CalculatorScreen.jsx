import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import CommonHeader from '../components/CommonHeader';

const { width } = Dimensions.get('window');

const CalculatorScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Trigger haptic feedback
  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const inputNumber = (num) => {
    triggerHaptic();
    if (waitingForOperand) {
      setDisplay(String(num));
      setExpression(expression + String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
      setExpression(expression === '' ? String(num) : expression + num);
    }
  };

  const inputDecimal = () => {
    triggerHaptic();
    if (waitingForOperand) {
      setDisplay('0.');
      setExpression(expression + '0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const clear = () => {
    triggerHaptic();
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    triggerHaptic();
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    setExpression(expression + ' ' + nextOperation + ' ');
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    triggerHaptic();
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setExpression(expression + '= ' + String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handlePercentage = () => {
    triggerHaptic();
    const value = parseFloat(display);
    const newValue = value / 100;
    setDisplay(String(newValue));
    setExpression(String(newValue));
  };

  const handlePlusMinus = () => {
    triggerHaptic();
    if (display !== '0') {
      const newValue = display.charAt(0) === '-' ? display.substr(1) : '-' + display;
      setDisplay(newValue);
      setExpression(newValue);
    }
  };

  const Button = ({ onPress, text, size = 1, themeType = 'default', icon }) => {
    // Layout constants
    const CONTAINER_PADDING = 24;
    const GAP = 14;
    const BUTTON_SIZE = (width - (CONTAINER_PADDING * 2) - (GAP * 3)) / 4;

    const buttonWidth = size === 2 ? (BUTTON_SIZE * 2) + GAP : BUTTON_SIZE;

    let backgroundColor = theme.card;
    let textColor = theme.text;

    if (themeType === 'secondary') {
      backgroundColor = '#D1D5DB'; // Light gray
      textColor = '#000000';
    } else if (themeType === 'accent') {
      backgroundColor = theme.primary;
      textColor = '#FFFFFF';
    }

    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: buttonWidth,
            height: BUTTON_SIZE, // Keep it circular based on single button width
            backgroundColor: backgroundColor,
            borderRadius: BUTTON_SIZE / 2,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {icon ? (
          <Ionicons name={icon} size={24} color={textColor} />
        ) : (
          <Text style={[styles.buttonText, { color: textColor }]}>{text}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <CommonHeader title="Calculator" showBack={true} />

      {/* Display */}
      <View style={styles.displayContainer}>
        <Text style={[styles.expressionText, { color: theme.textSecondary }]}>
          {expression}
        </Text>
        <Text
          style={[styles.displayText, { color: theme.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.row}>
          <Button text="C" themeType="secondary" onPress={clear} />
          <Button text="±" themeType="secondary" onPress={handlePlusMinus} />
          <Button text="%" themeType="secondary" onPress={handlePercentage} />
          <Button text="÷" themeType="accent" onPress={() => performOperation('÷')} />
        </View>

        <View style={styles.row}>
          <Button text="7" onPress={() => inputNumber(7)} />
          <Button text="8" onPress={() => inputNumber(8)} />
          <Button text="9" onPress={() => inputNumber(9)} />
          <Button text="×" themeType="accent" onPress={() => performOperation('×')} />
        </View>

        <View style={styles.row}>
          <Button text="4" onPress={() => inputNumber(4)} />
          <Button text="5" onPress={() => inputNumber(5)} />
          <Button text="6" onPress={() => inputNumber(6)} />
          <Button text="-" themeType="accent" onPress={() => performOperation('-')} />
        </View>

        <View style={styles.row}>
          <Button text="1" onPress={() => inputNumber(1)} />
          <Button text="2" onPress={() => inputNumber(2)} />
          <Button text="3" onPress={() => inputNumber(3)} />
          <Button text="+" themeType="accent" onPress={() => performOperation('+')} />
        </View>

        <View style={styles.row}>
          <Button text="0" size={2} onPress={() => inputNumber(0)} />
          <Button text="." onPress={inputDecimal} />
          <Button text="=" themeType="accent" onPress={handleEquals} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header styles removed
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingHorizontal: 24, // Increased padding
    paddingVertical: 32,
  },
  expressionText: {
    fontSize: 24,
    fontFamily: 'DMSans-Regular',
    marginBottom: 8,
    opacity: 0.7,
  },
  displayText: {
    fontSize: 64, // Larger display
    fontWeight: 'bold',
    fontFamily: 'DMSans-Bold',
    textAlign: 'right',
  },
  buttonContainer: {
    paddingHorizontal: 24, // Matches the CONTAINER_PADDING in Button component
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute evenly
    marginBottom: 12,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow removal for flat modern look, or minimal shadow if desired
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 3.84,
    // elevation: 2,
  },
  buttonText: {
    fontSize: 24, // Slightly smaller font
    fontWeight: '600',
    fontFamily: 'DMSans-SemiBold',
  },
});

export default CalculatorScreen;