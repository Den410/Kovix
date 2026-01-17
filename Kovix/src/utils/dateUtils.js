export const formatLastSeen = (lastActiveDate, isOnline) => {
    if (isOnline) return "У мережі";
    if (!lastActiveDate) return "Офлайн";

    let dateStr = lastActiveDate;
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z')) {
        dateStr += 'Z';
    }

    const now = new Date();
    const past = new Date(dateStr);
    
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return "Був(ла) щойно"; 

    if (diffMins < 1) return "Був(ла) щойно";
    if (diffMins < 60) return `Востаннє в мережі ${diffMins} хв. тому`;
    if (diffHours < 24) return `Востаннє в мережі ${diffHours} год. тому`;
    if (diffDays === 1) return "Востаннє в мережі вчора";
    
    return `Востаннє в мережі ${diffDays} дн. тому`;
};