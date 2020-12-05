# expo-mixpanel-hooks

This is an adaption of Ben Awad's [expo-mixpanel-analytics](https://github.com/benawad/expo-mixpanel-analytics/tree/master/src) but refactored to use React Hooks.

I used this in a project which has now ended. However, it might be useful for someone else.

Note: I have not tested the people functions.

## Usage

Import into App.tsx (or whatever it is named) like you would any other context provider.

```
import * as React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { AuthProvider } from './src/context'
import { MixpanelProvider } from 'expo-mixpanel-hooks'
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

## Available Mixpanel operations

```
identify("13793");

register({ email: "bob@bob.com" }); // super props sent on every request and persisted in AsyncStorage

track("Signed Up", { "Referred By": "Friend" });

people_set({ "$first_name": "Joe", "$last_name": "Doe", "$email": "joe.doe@example.com", "$created": "2013-04-01T13:20:00", "$phone": "4805551212", "Address": "1313 Mockingbird Lane", "Birthday": "1948-01-01" });

people_set_once({ "First login date": "2013-04-01T13:20:00" });

people_unset([ "Days Overdue" ]);

people_increment({ "Coins Gathered": 12 });

people_append({ "Power Ups": "Bubble Lead" });

people_union({ "Items purchased": ["socks", "shirts"] });

people_delete_user();

reset();

```
