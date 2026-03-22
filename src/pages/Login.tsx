import {useState} from 'react';
import {api} from '../lib/api';
import {Button} from '../components/ui/button';
import {Input} from '../components/ui/input';
import {useNavigate} from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await api.post('/login', {username, password});
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('username', username);
            navigate('/');
        } catch (e) {
            alert("Login fehlgeschlagen");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <Input className="mb-4" placeholder="Benutzername" value={username}
                   onChange={e => setUsername(e.target.value)}/>
            <Input className="mb-4" type="password" placeholder="Passwort" value={password}
                   onChange={e => setPassword(e.target.value)}/>
            <Button className="w-full" onClick={handleLogin}>Einloggen</Button>
        </div>
    );
}
