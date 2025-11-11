<?php
// enviar.php - simples handler de formulário de contato
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: /contato.html');
  exit;
}
$nome = filter_input(INPUT_POST,'nome', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST,'email', FILTER_VALIDATE_EMAIL);
$mensagem = filter_input(INPUT_POST,'mensagem', FILTER_SANITIZE_STRING);

if (!$nome || !$email || !$mensagem) {
  echo 'Dados inválidos. Volte e verifique os campos.';
  exit;
}

// <--- coloque o e-mail da loja aqui:
$to = 'seu-email@exemplo.com';
$subject = 'Contato via site: ' . $nome;
$body = "Nome: $nome
Email: $email

Mensagem:
$mensagem
";
$headers = 'From: ' . $email . "\r\n" .
           'Reply-To: ' . $email . "\r\n" .
           'X-Mailer: PHP/' . phpversion();

if (mail($to, $subject, $body, $headers)) {
  echo '<p>Mensagem enviada com sucesso. Obrigado!</p>';
  echo '<p><a href="index.html">Voltar ao site</a></p>';
} else {
  echo '<p>Erro ao enviar. Tente novamente mais tarde.</p>';
}
?>