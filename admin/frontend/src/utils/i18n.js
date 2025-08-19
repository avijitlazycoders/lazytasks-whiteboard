export function translate(key) {
    return key;
}

export function toBengaliNumber(num) {
    const bengaliDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    return String(num).replace(/\d/g, d => bengaliDigits[d]);
}