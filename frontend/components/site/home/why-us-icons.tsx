type IconProps = { className?: string };

/** Saat — deneyim */
export function WhyUsIconYears({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/** Çalıştır — canlıya hızlı alma */
export function WhyUsIconDeploy({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.348a1.125 1.125 0 01-1.667-.986V5.653z"
      />
    </svg>
  );
}

/** Konum işareti — yerinde destek */
export function WhyUsIconSupport({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

/** Dişli — özelleştirme */
export function WhyUsIconCustom({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.51 1.027.275 1.562l-.523 1.105c-.229.487-.173 1.052.169 1.448.347.394.892.583 1.423.583h1.086c.55 0 1.02.398 1.11.94l.213 1.281c.09.541-.229 1.075-.713 1.341l-.73.446a1.125 1.125 0 00-.539 1.177l.084.599c.09.547-.289 1.064-.783 1.214l-.87.259a1.125 1.125 0 01-1.369-.493l-.149-.894a1.13 1.13 0 00-.779-.928 1.126 1.126 0 00-1.206.109l-.737.528a1.125 1.125 0 01-1.45-.121l-.774-.774a1.126 1.126 0 01-.274-1.562l.522-1.105c.23-.489.173-1.056-.169-1.452a1.126 1.126 0 00-1.423-.582H15.81c-.55 0-1.019-.399-1.109-.942l-.213-1.281c-.09-.542.229-1.075.713-1.341l.731-.446a1.125 1.125 0 00.539-1.177l-.084-.599a1.125 1.125 0 01.783-1.217l.87-.258c.432-.129.894-.086 1.282.207l1.097.743c.397.267.917.297 1.337.086.42-.211.688-.659.743-1.154l.149-.894z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
