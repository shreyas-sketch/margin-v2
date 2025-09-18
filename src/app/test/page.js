'use client';

import { Button } from '@chakra-ui/react';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/smartapi/margin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbolToken: '100011' }),
      });
      const data = await res.json();
      console.log('Margin data:', data);
    } catch (err) {
      console.error('Error fetching margin:', err);
    } finally {
      setLoading(false);
    }
  };

  const handle2Click = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/smartapi/gainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbolToken: '100011' }),
      });
      const data = await res.json();
      console.log('Margin data:', data);
    } catch (err) {
      console.error('Error fetching margin:', err);
    } finally {
      setLoading(false);
    }

  }

  return (
    <div>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading…' : 'Fetch Margin'}
      </Button>
      <Button onClick={handle2Click} disabled={loading}>
        {loading ? 'Loading…' : 'Gainers'}
      </Button>
    </div>
  );
}
