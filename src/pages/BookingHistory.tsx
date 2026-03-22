import {useEffect, useState} from 'react';
import {api} from '../lib/api';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../components/ui/table';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {toast} from 'sonner';

type SortField = 'date' | 'airline' | 'route' | 'price';

export default function BookingHistory() {
    const [bookings, setBookings] = useState<any[]>([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterAirline, setFilterAirline] = useState('');
    const [filterRoute, setFilterRoute] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

    const fetchBookings = (targetPage = 0) => {
        const username = localStorage.getItem('username');
        if (username) {
            api.get(`/bookings/${username}`, { params: { page: targetPage, size: 10 } })
                .then(res => {
                    const calculatedPages = res.data.totalPages !== undefined
                        ? res.data.totalPages
                        : (res.data.totalSize ? Math.ceil(res.data.totalSize / 10) : 0);

                    setBookings(res.data.content || []);
                    setTotalPages(calculatedPages);
                    setPage(targetPage);
                })
                .catch(console.error);
        }
    };

    useEffect(() => {
        fetchBookings(0);
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
            fetchBookings(0);
        } catch (e) {
            toast.error("Fehler beim Löschen der Buchungen.");
            console.error(e);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <span className="text-zinc-600 ml-1">↕</span>;
        return sortDirection === 'asc' ? <span className="text-white ml-1">↑</span> : <span className="text-white ml-1">↓</span>;
    };

    const filteredAndSortedBookings = bookings
        .filter(b => {
            const matchAirline = filterAirline === '' || b.flight.airline.toLowerCase().includes(filterAirline.toLowerCase());

            const routeString = `${b.flight.departureCity} ${b.flight.destinationCity}`.toLowerCase();
            const matchRoute = filterRoute === '' || routeString.includes(filterRoute.toLowerCase());

            const dateString = new Date(b.bookingTimestamp).toLocaleDateString('de-CH');
            const matchDate = filterDate === '' || dateString.includes(filterDate);

            return matchAirline && matchRoute && matchDate;
        })
        .sort((a, b) => {
            let comparison = 0;

            if (sortField === 'date') {
                comparison = new Date(a.bookingTimestamp).getTime() - new Date(b.bookingTimestamp).getTime();
            } else if (sortField === 'airline') {
                comparison = a.flight.airline.localeCompare(b.flight.airline);
            } else if (sortField === 'route') {
                const routeA = `${a.flight.departureCity} ${a.flight.destinationCity}`;
                const routeB = `${b.flight.departureCity} ${b.flight.destinationCity}`;
                comparison = routeA.localeCompare(routeB);
            } else if (sortField === 'price') {
                comparison = a.flight.price - b.flight.price;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

    return (
        <div className="p-8 text-zinc-100 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">Meine Buchungen</h1>

                {bookings.length > 0 && (
                    <Button
                        onClick={handleDeleteAll}
                        className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-900/50"
                    >
                        🗑️ Alle löschen (Demo Reset)
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <Input
                    placeholder="Filtern nach Datum (z.B. 12.4.)"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                <Input
                    placeholder="Filtern nach Airline..."
                    value={filterAirline}
                    onChange={e => setFilterAirline(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
                />
                <Input
                    placeholder="Filtern nach Route (Ort)..."
                    value={filterRoute}
                    onChange={e => setFilterRoute(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
                />
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                <Table>
                    <TableHeader className="bg-zinc-900">
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                            <TableHead
                                className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors select-none"
                                onClick={() => handleSort('date')}
                            >
                                Buchungsdatum {getSortIcon('date')}
                            </TableHead>
                            <TableHead
                                className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors select-none"
                                onClick={() => handleSort('airline')}
                            >
                                Airline {getSortIcon('airline')}
                            </TableHead>
                            <TableHead
                                className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors select-none"
                                onClick={() => handleSort('route')}
                            >
                                Route {getSortIcon('route')}
                            </TableHead>
                            <TableHead
                                className="text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors select-none"
                                onClick={() => handleSort('price')}
                            >
                                Preis {getSortIcon('price')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAndSortedBookings.map((b: any) => (
                            <TableRow key={b.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                <TableCell>{new Date(b.bookingTimestamp).toLocaleString('de-CH')}</TableCell>
                                <TableCell className="font-medium text-zinc-300">{b.flight.airline}</TableCell>
                                <TableCell>{b.flight.departureCity} -{">"} {b.flight.destinationCity}</TableCell>
                                <TableCell className="font-bold text-zinc-200">CHF {b.flight.price.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                        {filteredAndSortedBookings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-zinc-500">
                                    Keine passenden Buchungen gefunden.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        disabled={page === 0}
                        onClick={() => fetchBookings(page - 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                        ← Zurück
                    </Button>
                    <span className="text-zinc-400 font-medium bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                        Seite {page + 1} von {totalPages}
                    </span>
                    <Button
                        disabled={page >= totalPages - 1}
                        onClick={() => fetchBookings(page + 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                    >
                        Weiter →
                    </Button>
                </div>
            )}
        </div>
    );
}
