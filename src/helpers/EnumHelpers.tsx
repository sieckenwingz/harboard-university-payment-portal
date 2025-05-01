export function getEnumKeyByValue<T extends { [key: string]: string }>(
    enumObj: T,
    value: string
): keyof T | undefined {
    return (Object.keys(enumObj) as (keyof T)[]).find((key) => enumObj[key] === value);
}