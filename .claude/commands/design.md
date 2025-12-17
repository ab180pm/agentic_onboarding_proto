# Design System Guide

이 프로젝트의 UI 컴포넌트 개발 시 반드시 아래 스타일 상수를 사용하세요.

## Style Constants Location
`src/components/onboarding/OnboardingManager.tsx` 상단에 정의됨

---

## INPUT_STYLES

입력 필드에 사용하는 스타일:

| Key | 용도 | 예시 |
|-----|------|------|
| `base` | 기본 텍스트 입력 | `<input className={INPUT_STYLES.base} />` |
| `error` | 에러 상태 입력 | `<input className={INPUT_STYLES.error} />` |
| `readonly` | 읽기 전용 | `<input className={INPUT_STYLES.readonly} readOnly />` |
| `textarea` | 멀티라인 입력 | `<textarea className={INPUT_STYLES.textarea} />` |
| `select` | 드롭다운 선택 | `<select className={INPUT_STYLES.select} />` |

---

## BUTTON_STYLES

버튼에 사용하는 스타일:

| Key | 용도 | 예시 |
|-----|------|------|
| `primary` | 기본 액션 버튼 | `<button className={BUTTON_STYLES.primary}>Submit</button>` |
| `primaryDisabled` | 비활성 버튼 | `<button className={BUTTON_STYLES.primaryDisabled} disabled>Submit</button>` |
| `primaryWithIcon` | 아이콘 포함 버튼 | `<button className={BUTTON_STYLES.primaryWithIcon}><Icon /> Text</button>` |
| `primaryWithIconMb` | 아이콘 + 하단 마진 | `<button className={BUTTON_STYLES.primaryWithIconMb}><Icon /> Text</button>` |
| `secondary` | 보조 액션 (blue-500) | `<button className={BUTTON_STYLES.secondary}>Secondary</button>` |
| `purple` | 특별 액션 | `<button className={BUTTON_STYLES.purple}>Special</button>` |

조건부 스타일링:
```tsx
<button className={isValid ? BUTTON_STYLES.primary : BUTTON_STYLES.primaryDisabled}>
  Submit
</button>
```

---

## CARD_STYLES

카드/컨테이너에 사용하는 스타일:

| Key | 용도 | 예시 |
|-----|------|------|
| `base` | 기본 카드 (p-5, mt-4) | `<div className={CARD_STYLES.base}>Content</div>` |
| `completed` | 완료된 상태 (opacity-60) | `<div className={CARD_STYLES.completed}>Done</div>` |

shadow 추가 시:
```tsx
<div className={`${CARD_STYLES.base} shadow-sm`}>Content</div>
```

---

## LABEL_STYLES

레이블/텍스트에 사용하는 스타일:

| Key | 용도 | 마진 |
|-----|------|------|
| `title` | 카드/섹션 제목 | mb-4 |
| `subtitle` | 부제목/설명 | mb-3 |
| `field` | 입력 필드 레이블 | mb-2 |
| `fieldDesc` | 필드 설명 텍스트 | mb-2 |

---

## 사용 규칙

1. **하드코딩 금지**: `className="w-full py-3..."` 대신 `className={BUTTON_STYLES.primary}` 사용
2. **일관성 유지**: 같은 용도의 UI는 같은 스타일 상수 사용
3. **확장 시**: 템플릿 리터럴로 추가 클래스 조합 `className={\`${CARD_STYLES.base} shadow-lg\`}`
4. **새 스타일 필요 시**: 상수 파일에 추가 후 사용

---

## 컴포넌트 구조 패턴

```tsx
function MyComponent({ isCompleted, onSubmit }) {
  if (isCompleted) {
    return (
      <div className={CARD_STYLES.completed}>
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span>Completed</span>
      </div>
    );
  }

  return (
    <div className={CARD_STYLES.base}>
      {/* Header */}
      <div className={LABEL_STYLES.title}>Section Title</div>
      <div className={LABEL_STYLES.subtitle}>Description text</div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className={LABEL_STYLES.field}>Field Label</label>
          <p className={LABEL_STYLES.fieldDesc}>Helper text</p>
          <input className={INPUT_STYLES.base} />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6">
        <button className={BUTTON_STYLES.primary} onClick={onSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}
```

---

## Spacing 규칙

- 카드 내부: `p-5` (CARD_STYLES.base에 포함)
- 필드 간격: `space-y-4` wrapper 사용
- 헤더 하단: `mb-6`
- 버튼 상단: `mt-6`
- 섹션 간격: `mt-4` (CARD_STYLES에 포함)
