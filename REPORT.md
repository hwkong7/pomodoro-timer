# 2026 웹서버프로그래밍 — 뽀모도로 타이머 만들기

작성자: 20230625 신혜원

---

수업 시간에 실습으로 만들어보라고 하셨던 뽀모도로 타이머였는데, 어차피 만드는 거 그냥 제출만 하기는 아까워서 내가 평소에 쓸 수 있게, 그리고 같이 공부하는 친구들한테도 도움이 되게 기능을 계속 붙여봤다. 처음엔 시작/초기화 버튼만 있는 단순한 타이머였는데 하다 보니 PWA까지 가게 됐다. 막히는 부분이 생길 때마다 AI(Claude)한테 물어보면서 원인을 찾고 코드를 고쳐나가는 식으로 작업했다.

**막힌 부분 1 — 뽀모도로 사이클을 어떻게 자동으로 넘길까**

처음엔 집중 모드가 끝나면 그냥 알림만 띄우고 멈췄는데, 실제 뽀모도로 기법처럼 "집중 끝나면 자동으로 휴식으로, 4번째 집중마다는 긴 휴식으로" 넘어가게 하고 싶었다. 그러려면 지금 어떤 모드가 끝났는지를 코드에서 알아야 하는데, 처음 짰던 모드 버튼에는 `data-time`만 있고 어떤 모드인지 구분할 값이 없었다. 그래서 버튼마다 `data-mode="focus"` 같은 값을 추가하고, 타이머가 끝났을 때 현재 활성화된 버튼의 `data-mode`를 읽어서 다음 모드를 정하는 식으로 바꿨다.

```js
function handleSessionComplete() {
  const finishedMode = document.querySelector('.mode-btn.active').dataset.mode;

  if (finishedMode === 'focus') {
    focusCount++;
    const isLongBreakTime = focusCount % 4 === 0;
    switchToMode(isLongBreakTime ? 'long' : 'short');
  } else {
    switchToMode('focus');
  }
}
```

**막힌 부분 2 — hidden 속성을 줬는데 왜 안 사라질까**

톱니바퀴/점 3개 버튼을 눌러야 뜨는 설정 팝업을 만들면서 `hidden` 속성으로 껐다 켰다 하면 되겠다 싶었는데, 처음부터 화면에 계속 떠 있었고 닫기 버튼을 눌러도 안 닫혔다. `hidden`을 `true`로 줬는데도 안 사라지길래 처음엔 JS 로직이 잘못된 줄 알았다. 알고 보니 CSS에서 그 요소에 `display: flex`를 직접 줘놨던 게 문제였다. `hidden` 속성은 브라우저가 기본적으로 `display: none`을 걸어주는 거지, 내가 직접 쓴 `display: flex` 같은 값보다 더 강하게 이기는 게 아니라는 걸 몰랐다. 그래서 아래처럼 `[hidden]` 선택자를 따로 만들어서 확실히 눌러줬다.

```css
.settings-overlay {
  display: flex; /* 평소 모달 배치용 */
}

.settings-overlay[hidden] {
  display: none; /* hidden이 켜지면 이게 이겨야 함 */
}
```

흔히 알려진 `[hidden] { display: none !important }` 방식과 같은 원리인데, 내 경우엔 굳이 `!important`까지 안 쓰고 클래스+속성 선택자 조합(`.settings-overlay[hidden]`)으로 우선순위를 올려서 해결했다. CSS 우선순위 계산이 실제로 버그를 만든다는 걸 처음 몸으로 겪었다.

**오늘 새로 안 것들**

- `data-*` 커스텀 속성으로 상태(모드 이름 등)를 태그에 저장해두고 JS에서 꺼내 쓰는 패턴
- `hidden` 속성과 CSS `display` 값이 우선순위상 부딪힐 수 있다는 것, `[hidden]` 선택자로 확실히 이기게 만드는 법
- Notification API로 브라우저 알림 띄우기, 권한이 `default` / `granted` / `denied` 세 단계로 나뉜다는 것

**다음에 해보고 싶은 것**

지금은 완료한 집중 세션 수를 새로고침하면 그냥 0으로 초기화되는데, `localStorage`에 저장해서 오늘 하루 동안은 유지되게 만들어보고 싶다. 그리고 지금 커스텀 시간 설정은 현재 활성화된 모드 하나에만 적용되는데, 집중/짧은 휴식/긴 휴식 세 가지를 각각 따로 저장해서 한 번만 설정해두면 계속 유지되도록 하고 싶다. 마지막으로 테마도 지금은 새로고침하면 핑크로 돌아오는데, 이것도 마지막으로 고른 테마를 기억하게 만들어보고 싶다.
