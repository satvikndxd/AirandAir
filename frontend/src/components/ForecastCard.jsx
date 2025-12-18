const ForecastCard = ({ day, aqi, condition }) => {
    const getIcon = () => {
        if (condition === "Sunny") return "fa-sun";
        if (condition === "Cloudy") return "fa-cloud-sun";
        if (condition === "Rainy") return "fa-cloud-rain";
        return "fa-sun";
    }

    const iconClass = condition === 'Cloudy' ? 'text-cyan-400' : 'text-amber-400';

    return (
        <div className="bg-white/5 backdrop-blur-sm px-5 py-4 rounded-xl flex flex-col items-center gap-2 min-w-[100px] border border-white/10 hover:bg-white/10 transition-all">
            <p className="text-xs text-gray-500 font-medium">{day}</p>
            <i className={`fa-solid ${getIcon()} text-2xl ${iconClass}`}></i>
            <p className="text-lg font-bold text-white">{aqi}</p>
        </div>
    );
};

export default ForecastCard;
