/*
    MoodMotion.io, motivate to move
    Copyright (C) 2024  Martijn Benjamin<benjamin@moodmotion.io>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
import { MoodMotion } from '@types'

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

type RegisterProps = {
    config: MoodMotion.ServiceWorkerConfig
}

export const register = ({ config }: RegisterProps) => {

    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {

        // The URL constructor is available in all browsers that support SW.
        const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href)

        if (publicUrl.origin !== window.location.origin) {
            // Our service worker won't work if PUBLIC_URL is on a different origin
            // from what our page is served on. This might happen if a CDN is used to
            // serve assets see https://github.com/facebook/create-react-app/issues/2374
            return
        }

        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

            if (isLocalhost) {

                // This is running on localhost. Let's check if a service worker still exists or not.
                checkValidServiceWorker({ swUrl, config })

                // Add some additional logging to localhost, pointing developers to the
                // service worker/PWA documentation.
                navigator.serviceWorker.ready.then(() => {
                    console.log(
                        'This web app is being served cache-first by a service ' +
                        'worker. To learn more, visit https://cra.link/PWA'
                    )
                })
            } else {
                // Is not localhost. Just register service worker
                registerValidSW({ swUrl, config })
            }
        })
    }
}

const registerValidSW = ({ swUrl, config }: { swUrl: string, config: MoodMotion.ServiceWorkerConfig }) => {

    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing
                if (installingWorker == null) {
                    return
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {

                            // At this point, the updated precached content has been fetched,
                            // we send a skip waiting message to invoke worker installation
                            // and refresh the window
                            registration.waiting!.postMessage({ type: 'SKIP_WAITING' })

                            /** @todo on source update, give user a message and choice to update */
                            window.location.reload()

                            // Execute callback
                            if (config && config.onUpdate) {
                                config.onUpdate(registration)
                            }
                        } else {
                            // At this point, everything has been precached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            console.log('Content is cached for offline use.')

                            // Execute callback
                            if (config && config.onSuccess) {
                                config.onSuccess(registration)
                            }
                        }
                    }
                }
            }
        }).catch((error) => {
            console.error('Error during service worker registration:', error)
        })
}

const checkValidServiceWorker = ({ swUrl, config }: { swUrl: string, config: MoodMotion.ServiceWorkerConfig }) => {

    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' }
    }).then((response) => {

        // Ensure service worker exists, and that we really are getting a JS file.
        const contentType = response.headers.get('content-type')

        if (response.status === 404 || (contentType != null && contentType.indexOf('javascript') === -1)) {

            // No service worker found. Probably a different app. Reload the page.
            navigator.serviceWorker.ready.then((registration) => {
                registration.unregister().then(() => {
                    window.location.reload()
                })
            })

        } else {

            // Service worker found. Proceed as normal.
            registerValidSW({ swUrl, config })
        }

    }).catch(() => {
        console.log('No internet connection found. App is running in offline mode.')
    })
}
