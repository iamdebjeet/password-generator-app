import { useState, useCallback, useEffect, useRef, react } from 'react'
  import { ToastContainer, toast } from 'react-toastify';
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import js from '@eslint/js'
// import './App.css'

function App() {
  const [length, setLength] = useState(8)
  const [numberAllowed, setnumberAllowed] = useState(false)
  const [charAllowed, setcharAllowed] = useState(false)
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('web')

  const passwordRef = useRef(password)

  const passwordGenerator = useCallback(() => {
    const small = 'abcdefghijklmnopqrstuvwxyz';
    const large = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+';

    const letters = small + large;

    let chars = letters;
    if (numberAllowed) chars += numbers;
    if (charAllowed) chars += special;

    let passwordArr = [];
    let usedIndexes = [];

    // First 3 characters: letters only
    for (let i = 0; i < 3; i++) {
      passwordArr.push(letters[Math.floor(Math.random() * letters.length)]);
    }

    for (let i = 3; i < length; i++) {
      passwordArr.push(chars[Math.floor(Math.random() * chars.length)]);
    }

    function getRandomIndex() {
      let index;
      do {
        index = Math.floor(Math.random() * (length - 3)) + 3;
      } while (usedIndexes.includes(index));

      usedIndexes.push(index);
      return index;
    }

    if (numberAllowed) {
      const index = getRandomIndex();
      passwordArr[index] = numbers[Math.floor(Math.random() * numbers.length)];
    }

    if (charAllowed) {
      const index = getRandomIndex();
      passwordArr[index] = special[Math.floor(Math.random() * special.length)];
    }

    setPassword(passwordArr.join(''));
    toast.success('Password Generated Successfully!');
  }, [length, numberAllowed, charAllowed]);

  const copyPasswordToClip = useCallback(() => {
    passwordRef.current.select();
    window.navigator.clipboard.writeText(passwordRef.current.value);
    toast.info('Password Copied to Clipboard!');
  }, [password])

  const getPasswordFromAPI = useCallback(async () => {
    const payload = {
      stringLength: length,
      numberRequired: numberAllowed,
      CharRequired: charAllowed,
    };

    try {
      const response = await fetch('https://password-generator-api-92vo.onrender.com/getPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setPassword(data.password);
      toast.success(data.message);
    } catch (err) {
      const error = err.response?.data?.message || err.message || 'An error occurred while fetching the password.';
      console.error('Error fetching password from API:', err);
      toast.error(error);
    }
  }, [length, numberAllowed, charAllowed]);


  useEffect(() => {
    if (mode === 'web') {
      passwordGenerator();
    } else {
      setPassword('');
    }
  }, [length, numberAllowed, charAllowed, passwordGenerator, mode, setPassword]);



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className='text-3xl font-bold text-center mt-10 text-blue-100'>Password Generator</h1>

      <div className='w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 text-orange-700 bg-slate-800'>
        <div className='flex px-4 py-3 items-center gap-x-4'>
          <label><input type='radio' value="web" checked={mode === 'web'} onChange={(e) => { setMode(e.target.value) }} /> Generate on Web</label>
          <label><input type='radio' value="api" checked={mode === 'api'} onChange={(e) => setMode(e.target.value)} /> Generate using API</label>
        </div>

        <h2 className='text-blue-100 text-center my-3'>Your Generated Password:</h2>
        <div className='flex shadow rounded-lg overflow-hidden mb-4'>
          <input
            type="text"
            value={password}
            className='outline-none w-full py-1 px-3 bg-slate-100'
            placeholder='password'
            ref={passwordRef}
            readOnly
          />
          <button
            className='outline-none bg-orange-700 text-slate-100 px-3 py-0.5 shrink-0'
            onClick={copyPasswordToClip}
          >Copy</button>
        </div>

        <div className='flex text-sm gap-x-2'>
          <div className='flex items-center gap-x-1'>
            <input type="range" min={8} max={30} value={length}
              className='cursor-pointer'
              onChange={(e) => { setLength(Number(e.target.value)) }} />
            <label>length: {length}</label>
          </div>

          <div className='flex items-center gap-x-1'>
            <input type="checkbox"
              defaultChecked={numberAllowed}
              onChange={(e) => setnumberAllowed((perv) => !perv)} />
            <label>Numbers</label>
          </div>

          <div className='flex items-center gap-x-1'>
            <input type="checkbox"
              defaultChecked={charAllowed}
              onChange={(e) => setcharAllowed((perv) => !perv)} />
            <label>Special Characters</label>
          </div>
        </div>

        {mode === 'api' && (
          <div className="flex justify-center mt-4">
            <button
              className='bg-orange-700 text-slate-100 px-4 py-2 w-1/2 flex items-center justify-center rounded'
              onClick={getPasswordFromAPI}
            >
              Get Password
            </button>
          </div>
        )}

        <p className='text-blue-100 text-center my-3 text-sm'>NOTE: For a strong password, keep Number and Special characters checked.</p>
      </div>
    </>
  )
}

export default App
