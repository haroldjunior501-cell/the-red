import { useCallback, useEffect, useState } from 'react';
import {
  approveAgentAction,
  rejectAgentAction,
  subscribeToAgentEvents,
  type AgentAction,
} from '../services/aiAgentService';

export function useAiAgent(matchId: string) {
  const [agentNotification, setAgentNotification] = useState<AgentAction | null>(null);

  useEffect(() => {
    if (!matchId) return undefined;
    const unsub = subscribeToAgentEvents(matchId, (action) => {
      if (action.requiresApproval) {
        setAgentNotification(action);
      }
    });
    return unsub;
  }, [matchId]);

  const approveAction = useCallback(async (action: AgentAction) => {
    await approveAgentAction(action);
    setAgentNotification(null);
  }, []);

  const rejectAction = useCallback(async (action: AgentAction) => {
    await rejectAgentAction(action);
    setAgentNotification(null);
  }, []);

  const dismissNotification = useCallback(() => {
    setAgentNotification(null);
  }, []);

  return { agentNotification, approveAction, rejectAction, dismissNotification };
}
