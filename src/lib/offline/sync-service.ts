export interface SyncAction {
    id: string;
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: 'customers' | 'invoices' | 'products';
    data: any;
    timestamp: number;
}

export class SyncService {
    private static QUEUE_KEY = 'offline_sync_queue';

    /**
     * Adds an action to the sync queue
     */
    static enqueue(action: Omit<SyncAction, 'id' | 'timestamp'>) {
        const queue = this.getQueue();
        const newAction: SyncAction = {
            ...action,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        queue.push(newAction);
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));

        // Attempt sync if online
        if (navigator.onLine) {
            this.sync();
        }
    }

    static getQueue(): SyncAction[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(this.QUEUE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Processes the queue when back online
     */
    static async sync() {
        if (!navigator.onLine) return;

        const queue = this.getQueue();
        if (queue.length === 0) return;

        console.log(`Syncing ${queue.length} actions...`);

        // In a real implementation, we would loop through and call server actions.
        // For this boilerplate, we'll leave the loop structure.
        for (const action of queue) {
            try {
                // await processAction(action);
                this.removeFromQueue(action.id);
            } catch (e) {
                console.error("Sync failed for action", action.id, e);
                // Handle conflict resolution here (e.g. check version mismatch)
            }
        }
    }

    private static removeFromQueue(id: string) {
        const queue = this.getQueue().filter(a => a.id !== id);
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    }
}
