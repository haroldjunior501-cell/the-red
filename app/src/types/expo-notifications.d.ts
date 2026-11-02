declare module 'expo-notifications' {
  export type NotificationBehavior = {
    shouldShowAlert: boolean;
    shouldPlaySound: boolean;
    shouldSetBadge: boolean;
    shouldShowBanner: boolean;
    shouldShowList: boolean;
  };

  export type NotificationHandler = {
    handleNotification: () => Promise<NotificationBehavior>;
  };

  export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

  export type NotificationPermissionsStatus = {
    status: PermissionStatus;
  };

  export type NotificationContentInput = {
    title?: string | null;
    body?: string | null;
    sound?: boolean | string | null;
    data?: Record<string, unknown>;
    channelId?: string;
  };

  export type NotificationRequest = {
    content: NotificationContentInput;
  };

  export type Notification = {
    request: NotificationRequest;
  };

  export type NotificationResponse = {
    notification: Notification;
  };

  export type Subscription = {
    remove: () => void;
  };

  export enum AndroidImportance {
    HIGH = 4,
  }

  export function setNotificationHandler(handler: NotificationHandler): void;
  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function requestPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: {
      name: string;
      importance: AndroidImportance;
      sound: string;
      vibrationPattern?: number[];
    }
  ): Promise<void>;
  export function scheduleNotificationAsync(options: {
    content: NotificationContentInput;
    trigger: null;
  }): Promise<string>;
  export function addNotificationReceivedListener(
    listener: (notification: Notification) => void
  ): Subscription;
  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void
  ): Subscription;
  export function getLastNotificationResponseAsync(): Promise<NotificationResponse | null>;
}
