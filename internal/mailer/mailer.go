package mailer

import(
	"bytes"
    "embed"
    "html/template"
    "time"

    "gopkg.in/mail.v2"
)

var templateFS embed.FS

type Mailer struct {
 	dialer *mail.Dialer
    sender string
}

func New(host string, port int, username, password, sender string) Mailer {
 	dialer := mail.NewDialer(host, port, username, password)
    dialer.Timeout = 5 * time.Second
    return Mailer{dialer: dialer, sender: sender}
}

func (m Mailer) Send(recipient, templateFile string, data any) error {
    tmpl, err := template.New("email").ParseFS(templateFS, "templates/"+templateFile)
    if err != nil { return err }

    subject := new(bytes.Buffer)
    err = tmpl.ExecuteTemplate(subject, "subject", data);
    if err != nil { return err }

    body := new(bytes.Buffer)
    err = tmpl.ExecuteTemplate(body, "body", data);
    if err != nil { return err }

    msg := mail.NewMessage()
    msg.SetHeader("To", recipient)
    msg.SetHeader("From", m.sender)
    msg.SetHeader("Subject", subject.String())
    msg.SetBody("text/html", body.String())

    return m.dialer.DialAndSend(msg)
}