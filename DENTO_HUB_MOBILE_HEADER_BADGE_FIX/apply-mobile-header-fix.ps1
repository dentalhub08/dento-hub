$ErrorActionPreference = 'Stop'

$cssPath = Join-Path (Get-Location) 'src/app/globals.css'
if (-not (Test-Path $cssPath)) {
  throw "Could not find src/app/globals.css. Run this script from inside the dento-hub-app folder."
}

$start = '/* ===== DENTO HUB mobile header + clean course number fix ===== */'
$end = '/* ===== END DENTO HUB mobile header + clean course number fix ===== */'

$block = @'
/* ===== DENTO HUB mobile header + clean course number fix ===== */

/* Keep course numbers visible but remove the colored square/badge around them. */
.course-card-photo .course-no {
  background: transparent !important;
  color: #6f858a !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-width: 0 !important;
  width: auto !important;
  height: auto !important;
  line-height: 1 !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  letter-spacing: .04em;
}

@media (max-width: 650px) {
  /* Three clean zones: menu | centered brand | account/cart actions. */
  .header-row {
    display: grid !important;
    grid-template-columns: 40px minmax(0, 1fr) auto !important;
    align-items: center !important;
    gap: 6px !important;
    height: 64px !important;
    position: relative;
  }

  .mobile-shop-link {
    grid-column: 1 !important;
    justify-self: start !important;
    width: 38px !important;
    min-width: 38px !important;
    height: 38px !important;
    margin: 0 !important;
  }

  .header-row > .brand-logo-link {
    grid-column: 2 !important;
    justify-self: center !important;
    min-width: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  .header-row .brand-logo-img {
    display: block !important;
    width: min(126px, 34vw) !important;
    height: 43px !important;
    object-fit: contain !important;
    object-position: center center !important;
  }

  .header-actions {
    grid-column: 3 !important;
    justify-self: end !important;
    margin-left: 0 !important;
    gap: 2px !important;
    display: flex !important;
    align-items: center !important;
    min-width: max-content;
  }

  .header-actions > .icon-link {
    display: none !important;
  }

  .header-actions .lang-btn {
    min-width: 32px !important;
    width: 32px !important;
    height: 36px !important;
    padding: 0 !important;
    font-size: 10px !important;
  }

  .header-actions .cart-link,
  .header-actions .account-session-btn,
  .header-actions .account-session-loading {
    min-width: 36px !important;
    width: 36px !important;
    height: 36px !important;
    padding: 0 !important;
    flex: 0 0 36px !important;
  }

  .header-actions .account-avatar {
    width: 32px !important;
    height: 32px !important;
  }

  .header-actions .account-session-copy,
  .header-actions .account-session-btn > svg:last-child {
    display: none !important;
  }

  /* Search owns a separate full-width row underneath the compact header. */
  .header-row > .searchbar {
    position: absolute !important;
    top: 68px !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    height: 43px !important;
    margin: 0 !important;
    z-index: 4;
    border-radius: 12px !important;
  }

  .site-header {
    margin-bottom: 55px !important;
  }
}

@media (max-width: 390px) {
  .header-row {
    grid-template-columns: 36px minmax(0, 1fr) auto !important;
    gap: 4px !important;
  }

  .header-row .brand-logo-img {
    width: min(108px, 31vw) !important;
    height: 40px !important;
  }

  .header-actions .lang-btn {
    display: none !important;
  }
}

/* ===== END DENTO HUB mobile header + clean course number fix ===== */
'@

$css = Get-Content -Raw -Path $cssPath
$escapedStart = [regex]::Escape($start)
$escapedEnd = [regex]::Escape($end)
$pattern = "$escapedStart[\s\S]*?$escapedEnd"

if ([regex]::IsMatch($css, $pattern)) {
  $css = [regex]::Replace($css, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $block })
} else {
  $css = $css.TrimEnd() + "`r`n`r`n" + $block + "`r`n"
}

Set-Content -Path $cssPath -Value $css -Encoding UTF8
Write-Host 'Applied DENTO HUB mobile header + course number fix successfully.' -ForegroundColor Green
