export const getSimpleFileSize = (fileSize: number): string => {
    if (!fileSize) {
        return '';
    }

    const oneKb = 1024;
    const oneMb = 1024 * 1024;
    if (fileSize < oneKb) {
        return `${fileSize}字节`;
    }
    const dotRegex = /^\d+\.\d{2,}$/;
    if (fileSize < oneMb) {
        const kbSize = fileSize / oneKb;
        return dotRegex.test(kbSize.toString()) ? `${kbSize.toFixed(2)}KB` : `${kbSize}KB`;
    } else {
        const mbSize = fileSize / oneMb;
        return dotRegex.test(mbSize.toString()) ? `${mbSize.toFixed(2)}MB` : `${mbSize}MB`;
    }
};
