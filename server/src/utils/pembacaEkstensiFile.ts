const pembacaEkstensiFile = (inputFile: string) => {
    const resultEkstensiFile = inputFile.match(/\.png$|\.jpg$|\.jpeg$/);
    if (resultEkstensiFile === null) return null;
    else return resultEkstensiFile[0];
};

export default pembacaEkstensiFile;