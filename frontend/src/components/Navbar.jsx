const Navbar = () => {
    return (
        <nav className="flex justify-between items-center py-5 px-10 z-10 relative">
            <div className="flex items-center gap-2.5 text-xl font-bold text-blue-900">
                <i className="fa-solid fa-leaf" style={{ color: '#48bb78' }}></i> AirZen
            </div>

            <div className="hidden md:flex gap-8 bg-[var(--glass-bg)] px-8 py-2.5 rounded-full border border-[var(--glass-border)] shadow-sm backdrop-blur-md">
                <button className="text-[var(--text-dark)] font-medium text-sm transition-colors">Home</button>
                <button className="text-[var(--text-light)] font-medium text-sm transition-colors hover:text-[var(--text-dark)]">Forecast</button>
                <button className="text-[var(--text-light)] font-medium text-sm transition-colors hover:text-[var(--text-dark)]">Map</button>
            </div>

            <div className="w-10 h-10 bg-[var(--glass-bg)] rounded-full flex items-center justify-center border border-[var(--glass-border)] cursor-pointer text-[var(--text-dark)]">
                <i className="fa-regular fa-user"></i>
            </div>
        </nav>
    );
};

export default Navbar;
