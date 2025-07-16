import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
    const location = useLocation();

    return (
        <div className="mx-auto bg-zinc-300 h-16 m-2">
            <div className="flex items-center justify-between px-4">
                <h1 className="text-2xl font-bold">Algorithm Visualizer</h1>
                <nav>
                    <ul className="flex space-x-4 m-2">
                        <Link to={'/ml'} className={`btn ${location.pathname === '/ml' ? 'btn-ghost' : 'btn-primary'}`}>
                            Linear Regression
                        </Link>
                        <Link
                            to={'/clustering'}
                            className={`btn ${location.pathname === '/clustering' ? 'btn-ghost' : 'btn-primary'}`}
                        >
                            Clustering
                        </Link>
                        <Link to={'/'} className={`btn ${location.pathname === '/' ? 'btn-ghost' : 'btn-primary'}`}>
                            Sorting
                        </Link>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default NavBar;
