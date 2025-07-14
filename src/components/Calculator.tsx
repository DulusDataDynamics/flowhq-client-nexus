
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const { key } = event;
      
      if (key >= '0' && key <= '9') {
        inputNumber(key);
      } else if (key === '.') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(key)) {
        performOperation(key);
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        performOperation('=');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear();
      } else if (key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, waitingForOperand]);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    const newDisplay = display.slice(0, -1);
    setDisplay(newDisplay || '0');
  };

  const performOperation = (nextOperation: string) => {
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
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const buttonClass = "h-12 text-lg font-medium";
  const operatorClass = "h-12 text-lg font-medium bg-blue-500 hover:bg-blue-600 text-white";
  const equalsClass = "h-12 text-lg font-medium bg-green-500 hover:bg-green-600 text-white";

  return (
    <Card className="w-full max-w-xs mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-center">Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <div className="text-right text-2xl font-mono font-bold text-gray-900 dark:text-gray-100 min-h-[2rem] overflow-hidden">
            {display}
          </div>
        </div>
        
        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <Button onClick={clear} variant="outline" className={buttonClass}>
            AC
          </Button>
          <Button onClick={backspace} variant="outline" className={buttonClass}>
            ⌫
          </Button>
          <Button onClick={() => performOperation('/')} className={operatorClass}>
            ÷
          </Button>
          <Button onClick={() => performOperation('*')} className={operatorClass}>
            ×
          </Button>
          
          {/* Row 2 */}
          <Button onClick={() => inputNumber('7')} variant="outline" className={buttonClass}>
            7
          </Button>
          <Button onClick={() => inputNumber('8')} variant="outline" className={buttonClass}>
            8
          </Button>
          <Button onClick={() => inputNumber('9')} variant="outline" className={buttonClass}>
            9
          </Button>
          <Button onClick={() => performOperation('-')} className={operatorClass}>
            −
          </Button>
          
          {/* Row 3 */}
          <Button onClick={() => inputNumber('4')} variant="outline" className={buttonClass}>
            4
          </Button>
          <Button onClick={() => inputNumber('5')} variant="outline" className={buttonClass}>
            5
          </Button>
          <Button onClick={() => inputNumber('6')} variant="outline" className={buttonClass}>
            6
          </Button>
          <Button onClick={() => performOperation('+')} className={operatorClass}>
            +
          </Button>
          
          {/* Row 4 */}
          <Button onClick={() => inputNumber('1')} variant="outline" className={buttonClass}>
            1
          </Button>
          <Button onClick={() => inputNumber('2')} variant="outline" className={buttonClass}>
            2
          </Button>
          <Button onClick={() => inputNumber('3')} variant="outline" className={buttonClass}>
            3
          </Button>
          <Button 
            onClick={() => performOperation('=')} 
            className={`${equalsClass} row-span-2`}
            style={{ gridRow: 'span 2' }}
          >
            =
          </Button>
          
          {/* Row 5 */}
          <Button 
            onClick={() => inputNumber('0')} 
            variant="outline" 
            className={`${buttonClass} col-span-2`}
          >
            0
          </Button>
          <Button onClick={inputDecimal} variant="outline" className={buttonClass}>
            .
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 text-center mt-2">
          Use keyboard for input: Numbers, +, -, *, /, Enter, Escape, Backspace
        </div>
      </CardContent>
    </Card>
  );
};
