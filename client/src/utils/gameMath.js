
export const calculateAccuracy = (correctCharsLength, typedLength)=>{
    if(typedLength === 0) return 0;
    return (correctCharsLength/typedLength) * 100;
};

export const calculateWPM = (correctCharsLength, startTime, endTime)=>{
    const elapsedTimeInMinutes = (endTime - startTime) / 60000;
    if(elapsedTimeInMinutes < 0.03) return 0; 
    return Math.round((correctCharsLength/5) / elapsedTimeInMinutes);
};

export const calculateProgress = (typedLength, targetLength)=>{
    if(targetLength === 0) return 0;
    return Math.floor((typedLength/targetLength)*100);
};