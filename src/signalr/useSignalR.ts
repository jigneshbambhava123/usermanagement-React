import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

type OnQuantityUpdate = (resourceId: number, newAvailableQuantity: number) => void;

export function useSignalR(onQuantityUpdate: OnQuantityUpdate) {
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5086/resourcehub') 
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveQuantityUpdate', (resourceId: number, newAvailableQuantity: number) => {
      onQuantityUpdate(resourceId, newAvailableQuantity);
    });

    connection
      .start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error:', err));

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, [onQuantityUpdate]);
}
