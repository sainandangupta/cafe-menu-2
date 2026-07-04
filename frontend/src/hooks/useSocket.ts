import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../services/socket';

interface UseSocketOptions {
  /** Join a cafe room (for owners/staff) */
  cafeId?: string | null;
  /** JWT token for authenticated room joins */
  token?: string | null;
  /** Join a table room (for customers tracking order status) */
  tableId?: string | null;
}

/**
 * Hook that connects to the Socket.IO server and joins the appropriate room(s).
 * Returns the socket instance for attaching event listeners.
 */
export const useSocket = (options: UseSocketOptions = {}): Socket => {
  const { cafeId, token, tableId } = options;
  const socket = getSocket();
  const joinedRoomsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    const handleConnect = () => {
      // Join cafe room for owners
      if (cafeId && !joinedRoomsRef.current.has(`cafe-${cafeId}`)) {
        socket.emit('joinCafe', { cafe_id: cafeId, token: token || undefined });
        joinedRoomsRef.current.add(`cafe-${cafeId}`);
      }

      // Join table room for customers
      if (tableId && !joinedRoomsRef.current.has(`table-${tableId}`)) {
        socket.emit('joinTable', { table_id: tableId });
        joinedRoomsRef.current.add(`table-${tableId}`);
      }
    };

    // If already connected, join immediately
    if (socket.connected) {
      handleConnect();
    }

    // Also join on (re)connect
    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, cafeId, token, tableId]);

  return socket;
};

export default useSocket;
