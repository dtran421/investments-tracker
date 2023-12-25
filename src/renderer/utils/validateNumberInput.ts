const validateNumberInput = (currValue: string, inputValue: string): string => {
    if (inputValue === "") {
        return "0";
    }

    if (!/^\d+\.?\d*$/.test(inputValue)) {
        return currValue;
    }

    if (parseInt(currValue) !== 0 || inputValue.includes(".")) {
        return inputValue.toString();
    }

    const numInput = parseInt(inputValue);
    if (numInput === 0 || Number.isNaN(numInput)) {
        return Number(currValue).toString();
    }

    return numInput.toString();
};

export default validateNumberInput;
