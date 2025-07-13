
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        handleNumber(key);
      } else if (key === '.') {
        handleDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        handleOperation(key);
      } else if (key === 'Enter' || key === '=') {
        handleEquals();
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleClear();
      } else if (key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, waitingForNewValue]);

  const handleNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={display}
          readOnly
          className="text-right text-2xl font-mono h-12"
        />
        
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" onClick={handleClear} className="col-span-2">
            Clear
          </Button>
          <Button variant="outline" onClick={handleBackspace}>
            ⌫
          </Button>
          <Button variant="outline" onClick={() => handleOperation('/')}>
            ÷
          </Button>

          <Button variant="outline" onClick={() => handleNumber('7')}>
            7
          </Button>
          <Button variant="outline" onClick={() => handleNumber('8')}>
            8
          </Button>
          <Button variant="outline" onClick={() => handleNumber('9')}>
            9
          </Button>
          <Button variant="outline" onClick={() => handleOperation('*')}>
            ×
          </Button>

          <Button variant="outline" onClick={() => handleNumber('4')}>
            4
          </Button>
          <Button variant="outline" onClick={() => handleNumber('5')}>
            5
          </Button>
          <Button variant="outline" onClick={() => handleNumber('6')}>
            6
          </Button>
          <Button variant="outline" onClick={() => handleOperation('-')}>
            -
          </Button>

          <Button variant="outline" onClick={() => handleNumber('1')}>
            1
          </Button>
          <Button variant="outline" onClick={() => handleNumber('2')}>
            2
          </Button>
          <Button variant="outline" onClick={() => handleNumber('3')}>
            3
          </Button>
          <Button variant="outline" onClick={() => handleOperation('+')} className="row-span-2">
            +
          </Button>

          <Button variant="outline" onClick={() => handleNumber('0')} className="col-span-2">
            0
          </Button>
          <Button variant="outline" onClick={handleDecimal}>
            .
          </Button>
        </div>

        <Button onClick={handleEquals} className="w-full">
          =
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Use keyboard: Numbers, +, -, *, /, Enter/=, Escape/C (clear), Backspace
        </div>
      </CardContent>
    </Card>
  );
};
