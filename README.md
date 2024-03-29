# whatsnom-mobile

Mobile code, built on the ionic platform (which publishes to iOS and Android)

Setup:
- Install Git (and optionally Git Desktop), if you haven't already
- Install Ionic: http://ionicframework.com/getting-started (will ask you to install node.js and XCode)
- Pull repo as ionic library
- pull whatsnom repo for server code, particularly the /api directory which serves all jsonp requests
- follow http://ionicframework.com/docs/guide/testing.html to debug app (easiest is to test on http://localhost:8100/)

For Setup, you'll likely have to install some dependencies + setup, including commands like:
- sudo npm install -g cordova
- sudo npm install -g ios-sim
- sudo npm install -g cordova ionic
- ionic plugin add cordova-plugin-inappbrowser
- ionic platform add ios
- ionic build ios
- ionic emulate ios



To rename:
- ionic platform remove ios
- ionic platform add ios
- apply this: https://gist.github.com/mlynch/284699d676fe9ed0abfa
- open settings and set 'require fullscreen' bit

Android Release Code:
- cdh
- cordova build --release android
- jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore resources/key/my-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
- enter passowrd for jarsigner
- ~/Library/Android/sdk/build-tools/23.0.3/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/WhatsNom.apk
- upload new version to google play store https://play.google.com/apps/publish/?dev_acc=14410831066730830338#AppListPlace
- update version number for next release in config.xml


iOS Release Process:
- cdh
- ionic build ios
- open Xcode project generated inside /platforms/ios
- go to Product Menu -> Archive
- Upload new version to app store
- wait 15 minutes
- submit new version to app store from itunes connect
- update version number for next release in config.xml

