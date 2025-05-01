import { useAccessibility } from "@/context/AccessibilityContext";

function Flights({trip}) {
    const { colorMode } = useAccessibility();
    
    const bestLink = trip?.tripData?.flights?.options?.best?.outbound?.bookingLinks?.momondo;
    const cheapestLink = trip?.tripData?.flights?.options?.cheapest?.outbound?.bookingLinks?.momondo;
    const quickestLink = trip?.tripData?.flights?.options?.quickest?.outbound?.bookingLinks?.momondo;

    const getAccessibleColor = (colorType) => {
        const colorMap = {
            default: {
                bestBg: 'rgba(34, 197, 94, 0.1)',
                bestText: '#22c55e',
                cheapestBg: 'rgba(59, 130, 246, 0.1)',
                cheapestText: '#3b82f6',
                quickestBg: 'rgba(168, 85, 247, 0.1)',
                quickestText: '#a855f7',
            },
            protanopia: {
                bestBg: 'rgba(59, 130, 246, 0.1)',
                bestText: '#3b82f6',
                cheapestBg: 'rgba(99, 102, 241, 0.1)',
                cheapestText: '#6366f1',
                quickestBg: 'rgba(79, 70, 229, 0.1)',
                quickestText: '#4f46e5',
            },
            deuteranopia: {
                bestBg: 'rgba(59, 130, 246, 0.1)',
                bestText: '#3b82f6',
                cheapestBg: 'rgba(29, 78, 216, 0.1)',
                cheapestText: '#1d4ed8',
                quickestBg: 'rgba(30, 64, 175, 0.1)',
                quickestText: '#1e40af',
            },
            tritanopia: {
                bestBg: 'rgba(239, 68, 68, 0.1)',
                bestText: '#ef4444',
                cheapestBg: 'rgba(59, 130, 246, 0.1)',
                cheapestText: '#3b82f6',
                quickestBg: 'rgba(79, 70, 229, 0.1)',
                quickestText: '#4f46e5',
            },
            monochromacy: {
                bestBg: 'rgba(156, 163, 175, 0.1)',
                bestText: '#9ca3af',
                cheapestBg: 'rgba(107, 114, 128, 0.1)',
                cheapestText: '#6b7280',
                quickestBg: 'rgba(75, 85, 99, 0.1)',
                quickestText: '#4b5563',
            }
        };
        
        return colorMap[colorMode]?.[colorType] || colorMap.default[colorType];
    };

    const formatFlightPrice = (price) => {
        if (!price) return '$0';
        const numericPrice = parseFloat(price.replace('$', ''));
        if (isNaN(numericPrice)) return '$0';
        return `$${Math.round(numericPrice)}`;
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto">
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-4'>
                {/* Best Flight Option */}
                <div 
                    className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'
                    onClick={() => window.open(bestLink, '_blank', 'noopener,noreferrer')}
                >
                    <div className='px-3 py-1 rounded-full w-fit mb-3'
                         style={{
                             backgroundColor: getAccessibleColor('bestBg'),
                             color: getAccessibleColor('bestText')
                         }}>
                        Best Option
                    </div>
                    <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                            <span className='text-white font-medium'>
                                {trip?.tripData?.flights?.options?.best?.airline}
                            </span>
                            <span className='text-white font-bold'>
                                {trip?.tripData?.flights?.options?.best?.pricePerPerson}
                            </span>
                        </div>
                        <div className='text-gray-400 text-sm'>
                            <div>✈️ Total Duration: {trip?.tripData?.flights?.options?.best?.totalDuration}</div>
                            <div>🛑 Stops: {trip?.tripData?.flights?.options?.best?.outbound?.stops}</div>
                            <div>💺 Class: {trip?.tripData?.flights?.options?.best?.class}</div>
                        </div>
                    </div>
                </div>

                {/* Cheapest Flight Option */}
                <div 
                    className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'
                    onClick={() => window.open(cheapestLink, '_blank', 'noopener,noreferrer')}
                >
                    <div className='px-3 py-1 rounded-full w-fit mb-3'
                         style={{
                             backgroundColor: getAccessibleColor('cheapestBg'),
                             color: getAccessibleColor('cheapestText')
                         }}>
                        Cheapest Option
                    </div>
                    <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                            <span className='text-white font-medium'>
                                {trip?.tripData?.flights?.options?.cheapest?.airline}
                            </span>
                            <span className='text-white font-bold'>
                                {trip?.tripData?.flights?.options?.cheapest?.pricePerPerson}
                            </span>
                        </div>
                        <div className='text-gray-400 text-sm'>
                            <div>✈️ Total Duration: {trip?.tripData?.flights?.options?.cheapest?.totalDuration}</div>
                            <div>🛑 Stops: {trip?.tripData?.flights?.options?.cheapest?.outbound?.stops}</div>
                            <div>💺 Class: {trip?.tripData?.flights?.options?.cheapest?.class}</div>
                        </div>
                    </div>
                </div>

                {/* Quickest Flight Option */}
                <div 
                    className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'
                    onClick={() => window.open(quickestLink, '_blank', 'noopener,noreferrer')}
                >
                    <div className='px-3 py-1 rounded-full w-fit mb-3'
                         style={{
                             backgroundColor: getAccessibleColor('quickestBg'),
                             color: getAccessibleColor('quickestText')
                         }}>
                        Quickest Option
                    </div>
                    <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                            <span className='text-white font-medium'>
                                {trip?.tripData?.flights?.options?.quickest?.airline}
                            </span>
                            <span className='text-white font-bold'>
                                {trip?.tripData?.flights?.options?.quickest?.pricePerPerson}
                            </span>
                        </div>
                        <div className='text-gray-400 text-sm'>
                            <div>✈️ Total Duration: {trip?.tripData?.flights?.options?.quickest?.totalDuration}</div>
                            <div>🛑 Stops: {trip?.tripData?.flights?.options?.quickest?.outbound?.stops}</div>
                            <div>💺 Class: {trip?.tripData?.flights?.options?.quickest?.class}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Flights;