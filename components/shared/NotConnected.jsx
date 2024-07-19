import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const NotConnected = () => {
  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Attention, l'homme vert vous voit !</AlertTitle>
      <AlertDescription>
        Veuillez connecter votre Wallet à notre DApp.
      </AlertDescription>
    </Alert>
  )
}

export default NotConnected