import {useEffect, useState} from 'react';
import {api} from '../lib/api';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '../components/ui/card';
import {toast} from 'sonner';

export default function FlightSearch() {
    const [flights, setFlights] = useState([]);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [airline, setAirline] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [checkoutFlightId, setCheckoutFlightId] = useState<number | null>(null);
    const [paymentDetails, setPaymentDetails] = useState({
        name: 'Felix Huber',
        card: '4500123456789012',
        expiry: '12/28',
        cvv: '123'
    });

    const searchFlights = async (targetPage = 0) => {
        const params: any = {page: targetPage, size: 6};
        if (departure) params.departure = departure;
        if (destination) params.destination = destination;
        if (date) params.date = date;
        if (time) params.time = time;
        if (airline) params.airline = airline;
        if (maxPrice) params.maxPrice = maxPrice;
        if (availableOnly) params.availableOnly = availableOnly;

        try {
            const res = await api.get(`/flights`, {params});

            const calculatedPages = res.data.totalPages !== undefined
                ? res.data.totalPages
                : (res.data.totalSize ? Math.ceil(res.data.totalSize / 6) : 0);

            setFlights(res.data.content || []);
            setTotalPages(calculatedPages);
            setPage(targetPage);

        } catch (e) {
            toast.error("Fehler beim Laden der Flüge.");
            console.error(e);
        }
    };

    const handleFilterClick = () => {
        searchFlights(0);
    };

    const initiateCheckout = (flightId: number) => {
        const username = localStorage.getItem('username');
        if (!username) {
            toast.warning("Bitte loggen Sie sich ein, um zu buchen.");
            return;
        }
        setCheckoutFlightId(flightId);
    };

    const confirmBooking = async () => {
        const username = localStorage.getItem('username');
        if (!paymentDetails.name || !paymentDetails.card || !paymentDetails.expiry || !paymentDetails.cvv) {
            toast.error("Bitte füllen Sie alle Zahlungsdetails aus.");
            return;
        }

        try {
            await api.post('/bookings', {flightId: checkoutFlightId, username});
            toast.success("Zahlung erfolgreich! Flug gebucht.");
            setCheckoutFlightId(null);
            setPaymentDetails({
                name: 'Felix Huber',
                card: '4500123456789012',
                expiry: '12/28',
                cvv: '123'
            });
            searchFlights(page);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Buchung fehlgeschlagen.");
        }
    };

    useEffect(() => {
        searchFlights(0);
    }, []);

    return (
        <div className="py-10 space-y-10 text-zinc-100">
            <header className="flex items-center justify-around pb-2 border-b border-zinc-800">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Flüge suchen</h1>
                <h2 className="text-zinc-400">Finden Sie Ihren nächsten Flug mit FlyApp</h2>
            </header>

            <section className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Input
                        placeholder="Von (z.B. Zürich)"
                        value={departure}
                        onChange={e => setDeparture(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:bg-zinc-900 text-white placeholder:text-zinc-500"
                    />
                    <Input
                        placeholder="Nach (z.B. London)"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:bg-zinc-900 text-white placeholder:text-zinc-500"
                    />
                    <Input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:bg-zinc-900 text-white"
                    />
                    <Input
                        type="time"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:bg-zinc-900 text-white"
                    />
                    <Input
                        placeholder="Fluggesellschaft"
                        value={airline}
                        onChange={e => setAirline(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:bg-zinc-900 text-white lg:col-span-2 placeholder:text-zinc-500"
                    />
                    <Input
                        type="number"
                        placeholder="Max. Preis (CHF)"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 focus:bg-zinc-900 text-white lg:col-span-2 placeholder:text-zinc-500"
                    />

                    <div
                        className="flex items-center justify-between md:col-span-2 lg:col-span-4 mt-2 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={availableOnly}
                                onChange={e => setAvailableOnly(e.target.checked)}
                                className="w-5 h-5 accent-zinc-100 rounded border-zinc-700 bg-zinc-900"
                            />
                            <span className="font-medium text-zinc-200">Nur verfügbare Tickets anzeigen</span>
                        </label>
                        <Button onClick={handleFilterClick}
                                className="px-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-lg">
                            Flüge filtern
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {flights.map((f: any) => (
                    <Card
                        key={f.id}
                        className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border ${f.availableTickets <= 0 ? "opacity-60 bg-zinc-950 border-zinc-800/50" : "bg-zinc-900 border-zinc-800 text-white"}`}
                    >
                        <CardHeader className="pb-3 border-b border-zinc-800">
                            <CardTitle className="text-xl font-bold flex items-center gap-3 text-white">
                                <span
                                    className="font-mono text-lg bg-zinc-800 px-2 py-1 rounded text-white">{f.departureCity.substring(0, 3).toUpperCase()}</span>
                                ✈️
                                <span
                                    className="font-mono text-lg bg-zinc-800 px-2 py-1 rounded text-white">{f.destinationCity.substring(0, 3).toUpperCase()}</span>
                            </CardTitle>
                            <p className="text-sm text-zinc-400 font-medium">{f.departureCity} nach {f.destinationCity}</p>
                        </CardHeader>

                        <CardContent className="pt-5 space-y-4">
                            <div className="flex justify-between items-center text-zinc-300">
                                <p className="font-medium">{new Date(f.departureDate).toLocaleDateString('de-CH', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                                <p className="font-bold text-lg text-white">{f.departureTime.substring(0, 5)} Uhr</p>
                            </div>

                            <div
                                className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                <p className="text-sm text-zinc-400">Airline</p>
                                <p className="font-semibold text-zinc-100">{f.airline}</p>
                            </div>

                            <div className="flex items-end justify-between gap-4 pt-2">
                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-400">Preis pro Ticket</p>
                                    <p className="font-extrabold text-3xl text-white tracking-tight">CHF {f.price.toFixed(2)}</p>
                                </div>

                                <div
                                    className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${f.availableTickets > 0 ? "bg-green-950/50 text-green-300" : "bg-red-950/50 text-red-300"}`}>
                                    <span
                                        className={`w-2 h-2 rounded-full ${f.availableTickets > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
                                    {f.availableTickets} Tickets übrig
                                </div>
                            </div>

                            <hr className="my-4 border-zinc-800"/>

                            <Button
                                className={`w-full h-11 text-base rounded-xl transition-colors ${f.availableTickets > 0 ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-950" : "bg-zinc-800 text-zinc-600"}`}
                                disabled={f.availableTickets <= 0}
                                onClick={() => initiateCheckout(f.id)}
                            >
                                {f.availableTickets > 0 ? "Buchen" : "Ausgebucht"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {flights.length === 0 && (
                    <div
                        className="text-zinc-400 md:col-span-3 text-center py-20 px-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm flex flex-col items-center gap-4">
                        <span className="text-6xl">🗺️</span>
                        <p className="text-xl font-semibold text-zinc-100">Keine Flüge gefunden</p>
                        <p className="text-zinc-400 max-w-md">Es konnten keine Flüge für Ihre ausgewählten Kriterien
                            gefunden werden. Bitte passen Sie Ihre Filter an oder versuchen Sie es mit einer neuen
                            Suche.</p>
                    </div>
                )}
            </section>

            {/* NEU: Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-10 p-4">
                    <Button
                        disabled={page === 0}
                        onClick={() => searchFlights(page - 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                        ← Zurück
                    </Button>
                    <span className="text-zinc-400 font-medium">
                        Seite {page + 1} von {totalPages}
                    </span>
                    <Button
                        disabled={page >= totalPages - 1}
                        onClick={() => searchFlights(page + 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                        Weiter →
                    </Button>
                </div>
            )}

            {/* Checkout Modal */}
            {checkoutFlightId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 max-w-md w-full space-y-6">
                        <h2 className="text-2xl font-bold text-white">Sicherer Checkout</h2>
                        <p className="text-zinc-400 text-sm">Bitte geben Sie Ihre Zahlungsdaten ein, um die Buchung
                            abzuschließen.</p>

                        <div className="space-y-4">
                            <Input
                                placeholder="Name auf der Karte"
                                value={paymentDetails.name}
                                onChange={e => setPaymentDetails({...paymentDetails, name: e.target.value})}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                            <Input
                                placeholder="Kartennummer"
                                maxLength={16}
                                value={paymentDetails.card}
                                onChange={e => setPaymentDetails({...paymentDetails, card: e.target.value})}
                                className="bg-zinc-900 border-zinc-800 text-white"
                            />
                            <div className="flex gap-4">
                                <Input
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={paymentDetails.expiry}
                                    onChange={e => setPaymentDetails({...paymentDetails, expiry: e.target.value})}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                />
                                <Input
                                    placeholder="CVV"
                                    maxLength={3}
                                    type="password"
                                    value={paymentDetails.cvv}
                                    onChange={e => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                                    className="bg-zinc-900 border-zinc-800 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end pt-4">
                            <Button variant="ghost" onClick={() => setCheckoutFlightId(null)}
                                    className="text-zinc-400">Abbrechen</Button>
                            <Button onClick={confirmBooking} className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">Kostenpflichtig
                                buchen</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
