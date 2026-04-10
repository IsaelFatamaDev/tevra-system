export function getDashboardPath(role) {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return '/admin'
    case 'agent':
      return '/agente'
    case 'customer':
    default:
      return '/mi-cuenta'
  }
}
