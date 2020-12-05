# expo-mixpanel

This is an adaption of Ben Awad's [expo-mixpanel-analytics](https://github.com/benawad/expo-mixpanel-analytics/tree/master/src) but refactored to use React Hooks.

I used this in a project which has now ended. However, it might be useful for someone else.

Note: I have not tested the people functions.

## Usage

Import into App.tsx (or whatever it is named) like you would any other context provider.

```
import * as React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { AuthProvider } from './src/context'
import { MixpanelProvider } from 'expo-mixpanel'
import AppNavigation from './src/navigation'

const token = process.env.mixpanelToken

const AppWithProvider = () => {
  return (
    <ApolloProvider client={client}>
        <MixpanelProvider token={token}>
            <AuthProvider>
                <AppNavigation />
            </AuthProvider>
        </MixpanelProvider>
    </ApolloProvider>
  )
}

export default AppWithProvider

```

Then where you want to use the mixpanel functions

```
import { useMixpanelContext } from 'expo-mixpanel'

const Login = () => {

    const { track } = useMixpanelContext()

    const loginFunc = () => {

        track(Constants.deviceId || 'unknown device', {
            action: 'login'
        })

        login()
    }

    return (
        <Whatever />
    )
}
```
