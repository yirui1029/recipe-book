import AppTabs from '@/components/app-tabs';

// Layout du groupe (app) : il réutilise votre AppTabs (Slot + barre de navigation) sans modification.
// Le nom du groupe entre parenthèses n'apparaît pas dans les URLs : '/', '/recipes' et '/profile'
// restent valables dans BottomNavigation.
export default function AppLayout() {
  return <AppTabs />;
}