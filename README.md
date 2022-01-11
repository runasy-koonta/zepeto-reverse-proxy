
# zepeto-reverse-proxy
> Unity + ZEPETO Studio 개발 시에 외부에서 월드를 접속할 수 있도록 만들어주는 Reverse Proxy Server

## 사용 전 주의사항
실행시마다 포트가 다르게 설정되는 ZEPETO World 특성상, 편리하게 사용하기 위해서는 라우터/공유기의 DMZ 기능을 활성화해야 합니다.
이때, 이 애플리케이션을 포함해 PC에서 Listening중인 서비스가 외부에 노출되며, 해당 애플리케이션에 취약점이 존재한다면 위협이 될 수 있습니다. 반드시 주의해서 사용하세요.
이 애플리케이션을 사용해 민감한 내용을 가진 월드를 외부에 공개하지 마세요.

## 왜 필요한가요?
Unity를 통해 ZEPETO World를 개발할 때 모바일에서 테스트를 하기 위해 ZEPETO 플러그인의 "Play on ZEPETO" 버튼을 사용합니다.
그런데, 이 기능은 내부망에서의 사용을 목적으로 만들어져 외부에서 접속이 쉽지 않습니다.

## 어떻게 작동하나요?
"Play on ZEPETO" 버튼을 누르게 되면 QR코드가 표시되는데, 이 QR코드가 가리키는 URL은 다음과 같습니다.
```
ZEPETO://GAMESYSTEM/pretest/pretest?worldMeta={{내부망 IP와 Port를 이용한 HTTP Link}}&gatewayHost={{내부망 IP}}&gatewayPort={{서버 Port}}&gatewaySecured=false
```

그리고, worldMeta 파라미터의 HTTP Link를 접속하면 이런 JSON을 반환합니다.
```json
{
  "worldId": "",
  "version": "0.2.1.1641918793",
  "worldName": "",
  "assetBundleIos": "http://[내부 IP]/ios?__nocache=1641918793",
  "assetBundleAndroid": "http://[내부 IP]/android?__nocache=1641918793",
  "assetBundleOsx": "http://[내부 IP]/osx?__nocache=1641918793",
  "assetBundleWindows": "http://[내부 IP]/windows?__nocache=1641918793",
  "serverId": "",
  "packageInfo": {
    "worldId": "",
    "version": "0.2.1.1641918793",
    "maxClients": 8,
    "canInvite": true,
    "disableInvite": false,
    "disableRoomList": false,
    "disablePrivateRoom": false,
    "screenOrientation": 1,
    "mainScenePath": "Assets/__INITIALIZER.unity",
    "installedZepetoPackageJson": "",
    "minVersion": "",
    "hasServerCode": false,
    "entryId": "",
    "uploadTimeStamp": 0
  }
}
```
이 애플리케이션은 이 JSON을 중간에서 가로채 [내부 IP] 부분을 외부 IP(공인 IP)로 바꾼 뒤 반환해줍니다.

## 어떻게 사용하나요?

1. 이 애플리케이션을 설치하세요.
- 이 레포지토리를 클론하거나 다운로드하면 됩니다.

2. 애플리케이션을 실행합니다.
- 실행 후 두가지 정보를 입력해주어야 합니다.
- 첫번째는 ZEPETO World URL 입니다. Unity에서 "Play on ZEPETO" 버튼을 누른 뒤, 나타나는 QR코드 창에서 아래의 Copy URL을 눌러 URL을 복사한 뒤 붙여넣기 하세요.
- 두번째는 바꿀 IP입니다. 잘 모르겠다면, "Your external IP is "의 뒷 부분에 입력된 IP를 입력하세요. 애플리케이션이 자동으로 가져온 공인 IP입니다.

3. 표시되는 QR코드를 모바일 디바이스에서 스캔합니다.
- 최근 출시되는 대부분의 스마트폰의 기본 카메라에 QR코드를 가져다대면 자동으로 인식됩니다.
