import {useEffect, useState} from 'react';
import {api} from '../lib/api';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../components/ui/table';
import {Button} from '../components/ui/button';
import {toast} from 'sonner';

export default function BookingHistory() {
    const [bookings, setBookings] = useState([]);

    const fetchBookings = () => {
        const username = localStorage.getItem('username');
        if (username) {
            api.get(`/bookings/${username}`)
                .then(res => setBookings(res.data))
                .catch(() => {
                });
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleDeleteAll = async () => {
        const username = localStorage.getItem('username');
        if (!username) return;

        if (!window.confirm("Möchten Sie wirklich alle Buchungen löschen? Die Tickets werden wieder freigegeben.")) {
            return;
        }

        try {
            await api.delete(`/bookings/${username}`);
            toast.success("Demo-Reset: Alle Buchungen wurden gelöscht!");
            fetchBookings();
        } catch (e) {
            toast.error("Fehler beim Löschen der Buchungen.");
            console.error(e);
        }
    };

    return (
        <div className="p-8 text-zinc-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Meine Buchungen</h1>

                {/* Reset Button wird nur angezeigt, wenn es Buchungen gibt */}
                {bookings.length > 0 && (
                    <Button
                        onClick={handleDeleteAll}
                        className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-900/50"
                    >
                        🗑️ Alle löschen (Demo Reset)
                    </Button>
                )}
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Datum</TableHead>
                        <TableHead className="text-zinc-400">Route</TableHead>
                        <TableHead className="text-zinc-400">Preis</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((b: any) => (
                        <TableRow key={b.id} className="border-zinc-800 hover:bg-zinc-900/50">
                            <TableCell>{new Date(b.bookingTimestamp).toLocaleDateString('de-CH')}</TableCell>
                            <TableCell>{b.flight.departureCity} -{">"} {b.flight.destinationCity}</TableCell>
                            <TableCell>CHF {b.flight.price}</TableCell>
                        </TableRow>
                    ))}
                    {bookings.length === 0 && (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={3} className="text-center py-10 text-zinc-500">
                                Sie haben noch keine Flüge gebucht.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
