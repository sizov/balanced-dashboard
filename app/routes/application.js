Balanced.ApplicationRoute = Balanced.Route.extend({
    init: function () {
        var self = this;
        // Have to use setTimeout to get around callback ordering issues in
        // ember-auth
        Balanced.Auth.on('signInSuccess', function () {
            setTimeout(function () {
                var intendedDestinationHash = Balanced.Auth.getIntendedDestinationHash();
                if (intendedDestinationHash) {
                    Balanced.Auth.clearIntendedDestinationHash();
                    window.location.hash = intendedDestinationHash;
                } else {
                    self.transitionTo('index');
                }
            });
        });
        Balanced.Auth.on('signOutSuccess', function () {
            setTimeout(function () {
                self.transitionTo('login');
            });
        });
    },
    events: {
        error: function(error, transition) {
            Ember.Logger.error("Error while loading route ({0}: {1}): ".format(error.errorStatusCode, error.uri), error.stack || error);

            if(error.isError && error.errorStatusCode === 401) {
                Balanced.Auth.trigger('authAccess');
                // If we're not authorized, need to log in (maybe as a different user),
                // so let's log out
                Balanced.Auth.forgetLogin();
                this.transitionTo('login');
            } else if (error.isError && error.errorStatusCode === 404) {
                // if we couldn't find it, check that it's not the current
                // marketplace, since that would send us into an infinite loop
                if(error.get('uri') === $.cookie(Balanced.COOKIE.MARKETPLACE_URI)) {
                    $.removeCookie(Balanced.COOKIE.MARKETPLACE_URI, { path: '/' });
                }
                this.transitionTo('index');
            } else {
                this.transitionTo('index');
            }
        },
        signOut: function () {
            Balanced.Auth.signOut({
                xhrFields: {
                    withCredentials: true
                }
            });

        }
    }
});
