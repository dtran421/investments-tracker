const validateNumberInput = (currValue: string, inputValue: string): string => {
    const numInput = parseInt(inputValue, 10);
    if (inputValue === "") {
        return "0";
    }
    if (/^\d+\.?\d*$/.test(inputValue)) {
        if (parseInt(currValue, 10) === 0 && !inputValue.includes(".")) {
            if (numInput === 0 || Number.isNaN(numInput)) {
                return Number(currValue).toString();
            }
            return numInput.toString();
        }
        return inputValue.toString();
    }
    return currValue;
};

export default validateNumberInput;
