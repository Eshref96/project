const calculate = (n1, operator, n2) => {
  const firstNum = parseFloat(n1)
  const secondNum = parseFloat(n2)
  if (operator === 'add') return firstNum + secondNum
  if (operator === 'subtract') return firstNum - secondNum
  if (operator === 'multiply') return firstNum * secondNum
  if (operator === 'divide') return firstNum / secondNum
}

const getKeyType = key => {
  const { action } = key.dataset
  if (!action) return 'number'
  if (
    action === 'add' ||
    action === 'subtract' ||
    action === 'multiply' ||
    action === 'divide'
  ) return 'operator'
  
  return action
}

const createResultString = (key, displayedNum, state) => {
  const keyContent = key.textContent
  const keyType = getKeyType(key)
  const {
    firstValue,
    operator,
    modValue,
    previousKeyType
  } = state

  if (keyType === 'number') {
    return displayedNum === '0' ||
      previousKeyType === 'operator' ||
      previousKeyType === 'calculate'
      ? keyContent
      : displayedNum + keyContent
  }

  if (keyType === 'decimal') {
    if (!displayedNum.includes('.')) return displayedNum + '.'
    if (previousKeyType === 'operator' || previousKeyType === 'calculate') return '0.'
    return displayedNum
  }

  if (keyType === 'minus') {
    if (!displayedNum.includes('-')) return '-' + displayedNum
    return displayedNum.split('-')[1]
  }

  if (keyType === 'percent') {
    return displayedNum / 100
  }

  if (keyType === 'operator') {
    return firstValue &&
      operator &&
      previousKeyType !== 'operator' &&
      previousKeyType !== 'calculate'
      ? calculate(firstValue, operator, displayedNum)
      : displayedNum
  }

  if (keyType === 'clear') return 0

  if (keyType === 'calculate') {
    return firstValue
      ? previousKeyType === 'calculate'
        ? checkResultLength(calculate(displayedNum, operator, modValue))
        : checkResultLength(calculate(firstValue, operator, displayedNum))
      : displayedNum
  }
}

const checkResultLength = (resultString) => {
  if (resultString.length > 11) return resultString.substring(0, 11)
  return resultString
}

const updateCalculatorState = (key, calculator, calculatedValue, displayedNum) => {
  const keyType = getKeyType(key)
  const {
    firstValue,
    operator,
    modValue,
    previousKeyType
  } = calculator.dataset

  calculator.dataset.previousKeyType = keyType

  if (keyType === 'operator') {
    calculator.dataset.operator = key.dataset.action
    calculator.dataset.firstValue = firstValue &&
      operator &&
      previousKeyType !== 'operator' &&
      previousKeyType !== 'calculate'
      ? calculatedValue
      : displayedNum
  }

  if (keyType === 'calculate') {
    calculator.dataset.modValue = firstValue && previousKeyType === 'calculate'
      ? modValue
      : displayedNum
  }

  if (keyType === 'clear' && key.textContent === 'AC') {
    calculator.dataset.firstValue = ''
    calculator.dataset.modValue = ''
    calculator.dataset.operator = ''
    calculator.dataset.previousKeyType = ''
  }
}

const updateVisualState = (key, calculator) => {
  const keyType = getKeyType(key)
  Array.from(key.parentNode.children).forEach(k => k.classList.remove('is-depressed'))

  if (keyType === 'operator') key.classList.add('is-depressed')
  if (keyType === 'clear' && key.textContent !== 'AC') key.textContent = 'AC'
  if (keyType !== 'clear') {
    const clearButton = calculator.querySelector('[data-action=clear]')
    clearButton.textContent = 'CE'
  }
}


const keyPressed = (evt) => {
  let keys = document.querySelectorAll('button');
  let keyChar = evt.key;
  
  if (keyChar === 'Enter') {
    document.querySelector('[data-action="calculate"]').click();
  } else if (keyChar === 'Backspace') {
    document.querySelector('[data-action="clear"]').click();
  } else {
    for (let i = 0; i < keys.length; i++) {
      let char = keys[i].innerHTML;
      if (char == keyChar) {
        keys[i].click();
      }
    }
  }
}


const calculator = document.querySelector('.calculator')
const display = calculator.querySelector('.calculator__display')
const keys = calculator.querySelector('.calculator__keys')

window.addEventListener("keydown", keyPressed, false)

keys.addEventListener('click', e => {
  if (!e.target.matches('button')) return
  const key = e.target
  const displayedNum = display.textContent
  const resultString = checkResultLength(createResultString(key, displayedNum, calculator.dataset))

  display.textContent = resultString
  updateCalculatorState(key, calculator, resultString, displayedNum)
  updateVisualState(key, calculator)
})