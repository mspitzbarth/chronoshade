// src/services/reviewPromptService.ts
import * as vscode from "vscode";

const FIRST_ACTIVATED_AT_KEY = "chronoShade.firstActivatedAt";
const REVIEW_PROMPT_DISMISSED_KEY = "chronoShade.reviewPromptDismissed";
const REVIEW_PROMPT_NEXT_CHECK_KEY = "chronoShade.reviewPromptNextCheckAt";
const PROMPT_DELAY_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const MARKETPLACE_REVIEW_URL =
  "https://marketplace.visualstudio.com/items?itemName=markusmorita.chronoshade&ssr=false#review-details";

export class ReviewPromptService {
  public static async maybeShowPrompt(context: vscode.ExtensionContext): Promise<void> {
    try {
      const dismissed = context.globalState.get<boolean>(REVIEW_PROMPT_DISMISSED_KEY, false);
      if (dismissed) {
        return;
      }

      const now = Date.now();
      let firstActivatedAt = context.globalState.get<number>(FIRST_ACTIVATED_AT_KEY);
      if (!firstActivatedAt) {
        firstActivatedAt = now;
        await context.globalState.update(FIRST_ACTIVATED_AT_KEY, firstActivatedAt);
      }

      const nextCheckAt = context.globalState.get<number>(
        REVIEW_PROMPT_NEXT_CHECK_KEY,
        firstActivatedAt + PROMPT_DELAY_MS
      );

      if (now < nextCheckAt) {
        return;
      }

      const rate = vscode.l10n.t("Rate ChronoShade ⭐");
      const later = vscode.l10n.t("Remind Me Later");
      const dontAsk = vscode.l10n.t("Don't Ask Again");

      const choice = await vscode.window.showInformationMessage(
        vscode.l10n.t("Enjoying ChronoShade? A quick rating helps other developers find it."),
        rate,
        later,
        dontAsk
      );

      if (choice === rate) {
        await vscode.env.openExternal(vscode.Uri.parse(MARKETPLACE_REVIEW_URL));
        await context.globalState.update(REVIEW_PROMPT_DISMISSED_KEY, true);
      } else if (choice === dontAsk) {
        await context.globalState.update(REVIEW_PROMPT_DISMISSED_KEY, true);
      } else if (choice === later) {
        await context.globalState.update(REVIEW_PROMPT_NEXT_CHECK_KEY, now + PROMPT_DELAY_MS);
      }
    } catch {
      // Never let the review prompt affect activation.
    }
  }
}
