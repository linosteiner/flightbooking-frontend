import {BrowserRouter, Link, Navigate, Route, Routes} from 'react-router-dom';
import FlightSearch from './pages/FlightSearch';
import BookingHistory from './pages/BookingHistory';
import Login from './pages/Login';
import {Button} from './components/ui/button';
import {Toaster} from "sonner";

export default function App() {
    const isLoggedIn = !!localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
    };

    return (
        <BrowserRouter>
            <nav className="p-4 bg-zinc-950 border-b border-zinc-800 text-white flex gap-6 items-center shadow-md">
                <Link to="/" className="font-bold text-xl tracking-wide text-zinc-100">✈️ FlyApp</Link>
                <Link to="/" className="hover:text-zinc-300 transition-colors text-zinc-400">Suchen</Link>

                {isLoggedIn && (
                    <Link to="/history" className="hover:text-zinc-300 transition-colors text-zinc-400">Meine
                        Buchungen</Link>
                )}

                <div className="ml-auto flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <span className="text-sm text-zinc-400">Hallo, {username}</span>
                            <Button variant="secondary" size="sm" onClick={handleLogout}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border-none">Logout</Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button variant="secondary" size="sm"
                                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950">Login</Button>
                        </Link>
                    )}
                </div>
            </nav>

            <main className="min-h-screen bg-zinc-950">
                <div className="container mx-auto max-w-7xl">
                    <Routes>
                        <Route path="/" element={<FlightSearch/>}/>
                        <Route path="/login" element={<Login/>}/>

                        <Route
                            path="/history"
                            element={isLoggedIn ? <BookingHistory/> : <Navigate to="/login" replace/>}
                        />
                    </Routes>
                </div>
            </main>

            <Toaster theme="dark" position="bottom-right"/>
        </BrowserRouter>
    );
}
