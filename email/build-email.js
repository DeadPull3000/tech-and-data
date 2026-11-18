const fs = require('fs');
const path = require('path');

const emailDir = __dirname;
const posterPath = path.join(emailDir, 'poster.jpg');
const posterB64 = fs.readFileSync(posterPath).toString('base64');
const posterDataUri = 'data:image/jpeg;base64,' + posterB64;

function generateEmail(imageSrc) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Road to Doomsday Quiz — The Quizzing Club</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #EDE8D0; font-family: 'Trebuchet MS', 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">

  <!-- Outer Centering Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EDE8D0" style="background-color: #EDE8D0; width: 100%; margin: 0; padding: 24px 0;">
    <tr>
      <td align="center" style="padding: 0 10px;">

        <!-- Main Comic Container Table (600px Max) -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 4px solid #000000; box-shadow: 7px 7px 0px #000000; border-radius: 2px;">

          <!-- ═════ 1. VINTAGE MARVEL HEADER BANNER ═════ -->
          <tr>
            <td bgcolor="#FFE600" style="background-color: #FFE600; border-bottom: 4px solid #000000; padding: 10px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 15px; letter-spacing: 2px; color: #000000; text-transform: uppercase;">
                    MARVEL COMICS GROUP
                  </td>
                  <td align="right" style="font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; color: #000000; text-transform: uppercase; letter-spacing: 1px;">
                    SPECIAL ASHOKA DISPATCH
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 2. EMBEDDED RETRO POSTER ═════ -->
          <tr>
            <td align="center" bgcolor="#FFE600" style="background-color: #FFE600; padding: 0; border-bottom: 4px solid #000000; line-height: 0;">
              <img src="${imageSrc}" alt="Road to Doomsday Quiz Poster by Vaishnavi Jha - Retro Marvel Comic Cover" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: 0; margin: 0;" />
            </td>
          </tr>

          <!-- ═════ 3. COMIC TICKER / ISSUE BAR ═════ -->
          <tr>
            <td bgcolor="#C41230" style="background-color: #C41230; padding: 8px 16px; border-bottom: 3px solid #000000;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 14px; letter-spacing: 2px; color: #FFE600; text-transform: uppercase;">
                    &gt;&gt; ALL UNIVERSES ASSEMBLE! &bull; THURSDAY, 19TH NOV &bull; 8:00 PM &lt;&lt;
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 4. SALUTATION & OPENING ═════ -->
          <tr>
            <td style="padding: 24px 28px 12px 28px; background-color: #FFFFFF;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <!-- Comic Corner Badge -->
                    <div style="display: inline-block; background-color: #000000; color: #FFE600; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 2px; margin-bottom: 12px; letter-spacing: 1px;">
                      COMMUNIQUE // THE QUIZZING CLUB
                    </div>
                    
                    <h1 style="margin: 0 0 10px 0; font-family: 'Impact', 'Arial Black', sans-serif; font-size: 28px; line-height: 1.15; color: #000000; letter-spacing: 0.5px;">
                      GREETINGS ASHOKA,
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 5. TL;DR DOSSIER BOX (VINTAGE CAPTION PANEL) ═════ -->
          <tr>
            <td style="padding: 6px 28px 18px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFF8DB" style="background-color: #FFF8DB; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px; border-bottom: 2px dashed #000000;">
                          <span style="display: inline-block; background-color: #C41230; color: #FFFFFF; font-family: 'Impact', 'Arial Black', sans-serif; font-size: 13px; letter-spacing: 1.5px; padding: 2px 8px; border: 1.5px solid #000000;">
                            TL;DR
                          </span>
                          <span style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 18px; color: #000000; margin-left: 8px; vertical-align: middle; letter-spacing: 0.5px;">
                            A 'ROAD TO DOOMSDAY' QUIZ
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 10px; font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #111111; line-height: 1.4;">
                          By <strong>Vaishnavi Jha</strong> &bull; An epic Marvel-themed battle of wits celebrating the upcoming <em>Avengers: Doomsday</em>!
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 6. EVENT COORDINATES GRID (RETRO DOSSIER CARDS) ═════ -->
          <tr>
            <td style="padding: 4px 28px 20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Date Box -->
                  <td width="48%" valign="top" style="padding-right: 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F4F9F4" style="background-color: #F4F9F4; border: 2.5px solid #000000; box-shadow: 3px 3px 0px #000000;">
                      <tr>
                        <td style="padding: 12px 14px;">
                          <div style="display: inline-block; background-color: #000000; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; padding: 2px 6px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                            [ DATE ]
                          </div>
                          <div style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 16px; color: #000000; margin-top: 2px;">
                            Thursday, 19th November
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <!-- Time Box -->
                  <td width="48%" valign="top" style="padding-left: 6px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFF4E6" style="background-color: #FFF4E6; border: 2.5px solid #000000; box-shadow: 3px 3px 0px #000000;">
                      <tr>
                        <td style="padding: 12px 14px;">
                          <div style="display: inline-block; background-color: #000000; color: #FFE600; font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; padding: 2px 6px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                            [ ZERO HOUR // TIME ]
                          </div>
                          <div style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 16px; color: #000000; margin-top: 2px;">
                            8:00 PM Onwards
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Venue Row -->
                <tr>
                  <td colspan="2" style="padding-top: 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFE600" style="background-color: #FFE600; border: 2.5px solid #000000; box-shadow: 3px 3px 0px #000000;">
                      <tr>
                        <td style="padding: 14px 18px;">
                          <div style="display: inline-block; background-color: #000000; color: #FFE600; font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; padding: 2px 8px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                            [ COORDINATES // VENUE ]
                          </div>
                          <div style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 22px; color: #C41230; letter-spacing: 1px;">
                            AC-03-LR-003
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 7. NARRATIVE BODY (RETRO MARVEL COMIC COPY) ═════ -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <p style="margin: 0 0 14px 0; font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222;">
                In the spirit of the imminent release of the highly-anticipated <strong>'Avengers: Doomsday'</strong>, we are hosting a Marvel-themed quiz.
              </p>
              <p style="margin: 0; font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #222222;">
                Doctor Doom has cast his shadow across the Multiverse &mdash; from the classic comic panels of Stan Lee and Jack Kirby to the Marvel Cinematic Universe. Bring your squad, test your lore, and prepare for battle!
              </p>
            </td>
          </tr>

          <!-- ═════ 8. THE LOOT: GIANI'S COUPONS ACTION BURST ═════ -->
          <tr>
            <td style="padding: 0 28px 22px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#C41230" style="background-color: #C41230; border: 3px solid #000000; box-shadow: 4px 4px 0px #000000;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center">
                          <div style="display: inline-block; background-color: #FFE600; color: #000000; font-family: 'Impact', 'Arial Black', sans-serif; font-size: 12px; letter-spacing: 2px; padding: 2px 10px; border: 1.5px solid #000000; text-transform: uppercase;">
                            VICTORY BOUNTY
                          </div>
                          <div style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 21px; color: #FFFFFF; letter-spacing: 1px; margin-top: 8px; text-transform: uppercase;">
                            PULL UP AND GET A CHANCE TO WIN GIANI'S COUPONS!
                          </div>
                          <div style="font-family: 'Trebuchet MS', Arial, sans-serif; font-size: 13px; color: #FFF8DB; margin-top: 6px; font-weight: bold;">
                            Sweet treats, ice cream, and bragging rights for the trivia champions!
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 9. \"OPEN TO ALL\" RETRO COMIC BULLETIN ═════ -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F0F3F8" style="background-color: #F0F3F8; border: 3px solid #000000; border-radius: 3px; box-shadow: 4px 4px 0px #000000;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="display: inline-block; background-color: #000000; color: #FFE600; font-family: 'Impact', 'Arial Black', sans-serif; font-size: 11px; letter-spacing: 1.5px; padding: 2px 8px; border: 1px solid #000000; margin-bottom: 8px; text-transform: uppercase;">
                      NOTICE TO ALL RECRUITS &amp; VARIANTS
                    </div>
                    <div style="font-family: 'Trebuchet MS', 'Segoe UI', Arial, sans-serif; font-size: 14px; line-height: 1.55; color: #111111;">
                      <strong>NOTE:</strong> You do <strong>not</strong> need to be a member of the Quiz Club to attend quizzes! <strong>All quizzes are open to all</strong> &mdash; all batches, majors, variants, and casual fans are welcome. Just pull up!
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═════ 10. RETRO BULLPEN SIGN-OFF & FOOTER ═════ -->
          <tr>
            <td bgcolor="#000000" style="background-color: #000000; padding: 22px 28px; border-top: 4px solid #000000;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <div style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 16px; color: #FFE600; letter-spacing: 1px;">
                      REGARDS,
                    </div>
                    <div style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 22px; color: #FFFFFF; letter-spacing: 1.5px; margin-top: 2px;">
                      THE QUIZZING CLUB
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #AAAAAA; margin-top: 6px; letter-spacing: 0.5px;">
                      Ashoka University &bull; Special Dispatch
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <div style="display: inline-block; background-color: #FFE600; color: #000000; font-family: 'Impact', 'Arial Black', sans-serif; font-size: 13px; padding: 6px 12px; border: 2px solid #FFFFFF; letter-spacing: 1px;">
                      EXCELSIOR!
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Table -->

        <!-- Subtle Email Client Footer Note -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; margin-top: 14px;">
          <tr>
            <td align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 10px; color: #777777;">
              Sent with retro comic ink by The Quizzing Club &bull; Road to Doomsday
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// 1. Output relative image version (standard HTML email)
fs.writeFileSync(path.join(emailDir, 'email.html'), generateEmail('poster.jpg'), 'utf8');

// 2. Output embedded data URI version (100% self-contained for 1-click copy-paste into Gmail Compose window)
fs.writeFileSync(path.join(emailDir, 'email_embed.html'), generateEmail(posterDataUri), 'utf8');

// 3. Output plain text / markdown version
const textContent = `GREETINGS ASHOKA,

=======================================================
>> TL;DR: A 'ROAD TO DOOMSDAY' QUIZ BY VAISHNAVI JHA <<
=======================================================

[ DATE ]  : Thursday, 19th November
[ TIME ]  : 8:00 PM onwards
[ VENUE ] : AC-03-LR-003

In the spirit of the imminent release of the highly-anticipated 'Avengers: Doomsday', we are hosting a Marvel-themed quiz!

Doctor Doom has cast his shadow across the Multiverse. From classic comic panels to the MCU, bring your squad and test your lore!

-- VICTORY BOUNTY --
Pull up and get a chance to win Giani's coupons!

-- NOTICE TO ALL RECRUITS --
You do not need to be a member of the Quiz Club to attend quizzes! All quizzes are open to all.

EXCELSIOR!

Regards,
The Quizzing Club
Ashoka University
`;

fs.writeFileSync(path.join(emailDir, 'email.txt'), textContent, 'utf8');

// Also mirror to tech-and-data monorepo
const monorepoEmailDir = path.resolve(__dirname, '..', '..', 'tech-and-data', 'road-to-doomsday', 'email');
if (fs.existsSync(monorepoEmailDir)) {
  fs.writeFileSync(path.join(monorepoEmailDir, 'email.html'), generateEmail('poster.jpg'), 'utf8');
  fs.writeFileSync(path.join(monorepoEmailDir, 'email_embed.html'), generateEmail(posterDataUri), 'utf8');
  fs.writeFileSync(path.join(monorepoEmailDir, 'email.txt'), textContent, 'utf8');
}

console.log('Successfully generated all emoji-free retro email templates!');
