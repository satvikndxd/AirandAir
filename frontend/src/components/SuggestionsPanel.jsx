import React from 'react';

const SuggestionsPanel = ({ aqi, location }) => {
    const getSuggestions = () => {
        if (aqi <= 50) {
            return {
                statusColor: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10',
                borderColor: 'border-emerald-500/30',
                precautions: [
                    { icon: 'fa-person-running', text: 'Great for outdoor activities' },
                    { icon: 'fa-window-maximize', text: 'Open windows for fresh air' },
                ],
                improvements: [
                    { icon: 'fa-tree', text: 'Support green initiatives' },
                ]
            };
        } else if (aqi <= 100) {
            return {
                statusColor: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/30',
                precautions: [
                    { icon: 'fa-child', text: 'Limit outdoor exertion for sensitive groups' },
                    { icon: 'fa-eye', text: 'Watch for symptoms' },
                ],
                improvements: [
                    { icon: 'fa-car', text: 'Reduce vehicle usage' },
                ]
            };
        } else if (aqi <= 150) {
            return {
                statusColor: 'text-orange-400',
                bgColor: 'bg-orange-500/10',
                borderColor: 'border-orange-500/30',
                precautions: [
                    { icon: 'fa-mask-face', text: 'Wear N95 mask outdoors' },
                    { icon: 'fa-house', text: 'Keep windows closed' },
                ],
                improvements: [
                    { icon: 'fa-fan', text: 'Use air purifiers' },
                ]
            };
        } else {
            return {
                statusColor: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/30',
                precautions: [
                    { icon: 'fa-triangle-exclamation', text: 'Avoid outdoor activities' },
                    { icon: 'fa-mask-face', text: 'N95 mask required' },
                ],
                improvements: [
                    { icon: 'fa-phone', text: 'Report to authorities' },
                ]
            };
        }
    };

    const suggestions = getSuggestions();

    return (
        <div className={`bg-white/5 backdrop-blur-xl rounded-3xl border ${suggestions.borderColor} p-6 h-full`}>
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb text-amber-400"></i>
                Recommendations
            </h3>

            <div className="space-y-4">
                <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-shield-halved"></i> Health Tips
                    </h4>
                    <ul className="space-y-2">
                        {suggestions.precautions.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                <span className={`w-8 h-8 rounded-lg ${suggestions.bgColor} flex items-center justify-center ${suggestions.statusColor}`}>
                                    <i className={`fa-solid ${item.icon} text-xs`}></i>
                                </span>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-leaf"></i> Improve Air Quality
                    </h4>
                    <ul className="space-y-2">
                        {suggestions.improvements.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                    <i className={`fa-solid ${item.icon} text-xs`}></i>
                                </span>
                                {item.text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SuggestionsPanel;
