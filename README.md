# BetterSoundCloud

BetterSoundCloud (BSC) is an open source project to improve the usability of the SoundCloud browser interface. The project is primarily concerned with parsing, filtering, and collating SoundCloud items, whether they are tracks or playlists, and then presenting them in a way that is more intuitive for the user.

BSC can hide or remove tracks depending on the following criteria:
* Minimum track duration
* Maximum track duration
* If it is a repost
* If it is a promoted post
* If it is a playlist
* If it is on your stream or a user's profile

The platform is qutie extensible and custom filters can be written fairly easily to perform other DOM related operations to the feed.

### Prerequisites

This is a Chrome extension, so the only prerequisite is having Chrome installed.

### Installing

There are two ways to install the extension, locally or via the web store.

You can install the extension from [here](https://chrome.google.com/webstore/detail/better-soundcloud/nkeeogkohgghdbcjjjohielkpijpcpad) if you wish to use the latest stable version.

However you may be inclined to make modifications of your own to the extension, in which case you'll want to clone this repository and then load the public\_html folder as a local extension. You can find more information on loading local extensions [here](https://developer.chrome.com/extensions/getstarted#unpacked).



### Usage Instructions

Simply right click the BSC icon to the right of the URL field and configure BSC settings through the "options" menu item.

By default, only promoted posts are hidden.

## Authors

* **Brian Cefali** - *Initial work* - [Brocef](https://github.com/brocef)

See also the list of [contributors](https://github.com/brocef/BetterSoundCloud/contributors) who participated in this project.

## License

This project is licensed under the GNU 3 License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Luke for help with silly JavaScript "features"
* Shane, Alexis for help with early testing
