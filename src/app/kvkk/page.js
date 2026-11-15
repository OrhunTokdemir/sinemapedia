import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { SITE, formatDate, kvkkContactEmail } from "@/lib/site";
import KvkkLanguageSwitch from "./KvkkLanguageSwitch";

export const metadata = {
  title: "KVKK Aydınlatma Metni / Privacy Notice",
  description: "Sinemapedia kişisel verilerin korunması aydınlatma metni / privacy notice (KVKK).",
};

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-2 leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

// Read at request time so the address comes from the runtime env (not baked in at build).
async function ContactEmail() {
  await connection();
  const email = kvkkContactEmail();
  if (!email) return <b>[iletişim e-postası]</b>;
  return (
    <a href={`mailto:${email}`} className="font-semibold text-accent-ink underline">
      {email}
    </a>
  );
}

export default function KvkkPage() {
  return <KvkkLanguageSwitch tr={<KvkkTr />} en={<KvkkEn />} />;
}

function KvkkTr() {
  return (
    <article className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
        <p className="text-sm text-muted">
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) madde 10 kapsamında hazırlanmıştır. Son
          güncelleme: <time dateTime={SITE.kvkkUpdatedAt}>{formatDate(SITE.kvkkUpdatedAt, "tr-TR")}</time>
        </p>
      </header>

      <Section title="1. Veri Sorumlusu">
        <p>
          {SITE.name} (&ldquo;Site&rdquo;) kapsamında işlenen kişisel verilerinizin veri sorumlusu {SITE.author}&rsquo;dir
          (&ldquo;biz&rdquo;).
        </p>
      </Section>

      <Section title="2. İşlenen Kişisel Verileriniz">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <b>Kimlik ve iletişim:</b> üyelik sırasında verdiğiniz e-posta adresi, kullanıcı adı ve görünen ad.
          </li>
          <li>
            <b>Hesap güvenliği:</b> şifreniz, yalnızca geri döndürülemez biçimde özetlenmiş (scrypt) olarak saklanır;
            şifrenizin kendisi hiçbir zaman okunabilir halde tutulmaz. Her oturum açışınızda oturumun IP adresi ve
            tarayıcı bilgisi (user-agent) kaydedilir.
          </li>
          <li>
            <b>İsteğe bağlı profil bilgileri:</b> eklemeyi seçerseniz biyografi ve profil fotoğrafı bağlantısı.
          </li>
          <li>
            <b>Kullanıcı içeriği ve etkinlik:</b> yorumlarınız, beğenileriniz, puanlarınız, takip ettiğiniz ve sizi takip
            eden kullanıcılar, izleme listeniz, izlediğiniz bölümler ve bunlardan oluşan etkinlik akışı kayıtları.
          </li>
          <li>
            <b>Güvenlik ve hata kayıtları:</b> sunucu kayıtlarında (log) kullanıcı kimlik numaranız, oturum açma ve kayıt
            olaylarının sonucu, yaptığınız işlemlerin türü (ör. puan verme, yorum ekleme, takip) ile{" "}
            <b>son bölümü maskelenmiş IP adresi</b> tutulur. Şifre, e-posta adresi, yorum metni ve arama terimleri bu
            kayıtlara yazılmaz.
          </li>
          <li>
            <b>Çerezler:</b> oturumunuzu açık tutmak için zorunlu bir oturum çerezi ve tercih ettiğiniz renk temasını
            hatırlayan bir tema çerezi. Reklam, analiz veya takip amaçlı çerez kullanılmaz.
          </li>
        </ul>
      </Section>

      <Section title="3. Toplama Yöntemi ve Hukuki Sebep">
        <p>
          Kişisel verileriniz, üyelik formu ve Site&rsquo;yi kullanmanız sırasında elektronik ortamda, doğrudan sizden
          toplanır. Verileriniz KVKK madde 5/2-(c) uyarınca üyelik sözleşmesinin kurulması ve ifası için gerekli olması ve
          oturum güvenliği bilgileri bakımından madde 5/2-(f) uyarınca meşru menfaatimiz hukuki sebeplerine dayanılarak
          işlenir.
        </p>
      </Section>

      <Section title="4. İşleme Amaçları">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Üyelik hesabınızın oluşturulması, oturum açmanız ve hesabınızın yönetilmesi,</li>
          <li>Dizi takibi, puanlama, yorum, beğeni ve takip özelliklerinin sunulması,</li>
          <li>Hesap ve Site güvenliğinin sağlanması, kötüye kullanımın önlenmesi, hataların tespiti ve giderilmesi.</li>
        </ul>
      </Section>

      <Section title="5. Kişisel Verilerin Aktarılması">
        <p>
          Yorumlar, beğeniler ve takipler dahil tüm verileriniz <b>yalnızca tarafımızca saklanır</b> ve{" "}
          <b>üçüncü kişilerle paylaşılmaz</b>; yurt içine veya yurt dışına aktarılmaz.
        </p>
        <p>
          Film ve dizi bilgileri TMDB&rsquo;den (The Movie Database) alınır. Bu istekler sunucumuz üzerinden yapıldığı ve
          görseller de sunucumuz aracılığıyla iletildiği için TMDB&rsquo;ye sizinle ilgili hiçbir kişisel veri gönderilmez.
        </p>
        <p>
          Sitenin doğası gereği, kendi paylaştığınız içerikler (yorumlar, puanlar, profil bilgileriniz, takip ilişkileri
          ve etkinlik akışınız) Site&rsquo;deki diğer kullanıcılar tarafından görüntülenebilir.
        </p>
      </Section>

      <Section title="6. Saklama Süresi">
        <p>
          Kişisel verileriniz hesabınız açık kaldığı sürece saklanır ve hesabınızın silinmesini talep etmeniz halinde
          silinir. Oturum kayıtları (IP adresi ve tarayıcı bilgisi) oturumun sona ermesiyle, en geç 7 gün içinde geçerliliğini
          yitirir. Güvenlik ve hata kayıtları en fazla 30 gün saklanır ve ardından silinir.
        </p>
      </Section>

      <Section title="7. KVKK Madde 11 Kapsamındaki Haklarınız">
        <p>Veri sorumlusuna başvurarak:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
          <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
          <li>KVKK madde 7&rsquo;deki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
          <li>Düzeltme, silme ve yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
          <li>
            İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun
            ortaya çıkmasına itiraz etme,
          </li>
          <li>Kanuna aykırı işleme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
        </ul>
        <p>haklarına sahipsiniz.</p>
      </Section>

      <Section title="8. Başvuru">
        <p>
          Haklarınıza ilişkin taleplerinizi <Suspense fallback={<b>…</b>}>
            <ContactEmail />
          </Suspense> adresine iletebilirsiniz. Başvurunuz, talebin niteliğine
          göre en geç 30 gün içinde ücretsiz olarak sonuçlandırılır.
        </p>
      </Section>

      <p className="border-t border-border pt-4 text-sm text-muted">
        <Link href="/" className="hover:text-accent-ink">← {SITE.name} ana sayfası</Link>
      </p>
    </article>
  );
}

function KvkkEn() {
  return (
    <article className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Personal Data Protection Notice</h1>
        <p className="text-sm text-muted">
          Prepared under Article 10 of the Turkish Personal Data Protection Law No. 6698 (&ldquo;KVKK&rdquo;). Last
          updated: <time dateTime={SITE.kvkkUpdatedAt}>{formatDate(SITE.kvkkUpdatedAt)}</time>
        </p>
        <p className="text-sm text-muted italic">
          This English translation is provided for convenience; in case of any discrepancy, the Turkish version prevails.
        </p>
      </header>

      <Section title="1. Data Controller">
        <p>
          The data controller for personal data processed on {SITE.name} (the &ldquo;Site&rdquo;) is {SITE.author}{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>
      </Section>

      <Section title="2. Personal Data We Process">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <b>Identity and contact:</b> the email address, username and display name you provide when signing up.
          </li>
          <li>
            <b>Account security:</b> your password is stored only as a one-way hash (scrypt); the password itself is never
            kept in readable form. Each time you log in, the session&rsquo;s IP address and browser information (user-agent)
            are recorded.
          </li>
          <li>
            <b>Optional profile information:</b> a bio and profile photo link, if you choose to add them.
          </li>
          <li>
            <b>User content and activity:</b> your comments, likes, ratings, the users you follow and who follow you, your
            watchlist, the episodes you have watched, and the activity feed records created from these.
          </li>
          <li>
            <b>Security and error logs:</b> server logs record your user ID, the outcome of sign-up and log-in events, the
            type of actions you take (e.g. rating, commenting, following) and your <b>IP address with its last part
            masked</b>. Passwords, email addresses, comment text and search terms are never written to these logs.
          </li>
          <li>
            <b>Cookies:</b> a required session cookie that keeps you logged in, and a theme cookie that remembers your
            preferred color theme. No advertising, analytics or tracking cookies are used.
          </li>
        </ul>
      </Section>

      <Section title="3. Collection Method and Legal Basis">
        <p>
          Your personal data is collected electronically, directly from you, through the sign-up form and your use of the
          Site. It is processed on the legal bases of Article 5/2-(c) of the KVKK, as it is necessary for the conclusion
          and performance of the membership agreement, and, for session security information, Article 5/2-(f), our
          legitimate interest.
        </p>
      </Section>

      <Section title="4. Purposes of Processing">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Creating your account, letting you log in, and managing your account;</li>
          <li>Providing series tracking, rating, commenting, liking and following features;</li>
          <li>Keeping your account and the Site secure, preventing misuse, and detecting and fixing errors.</li>
        </ul>
      </Section>

      <Section title="5. Transfer of Personal Data">
        <p>
          All of your data, including comments, likes and follows, is <b>stored only by us</b> and is{" "}
          <b>not shared with any third parties</b>; it is not transferred to any other party in Turkey or abroad.
        </p>
        <p>
          Movie and series information is obtained from TMDB (The Movie Database). Because these requests are made by our
          server and images are also delivered through our server, no personal data about you is sent to TMDB.
        </p>
        <p>
          By the nature of the Site, the content you share yourself (comments, ratings, profile information, follow
          relationships and your activity feed) can be viewed by other users of the Site.
        </p>
      </Section>

      <Section title="6. Retention Period">
        <p>
          Your personal data is kept for as long as your account remains open and is deleted if you request deletion of
          your account. Session records (IP address and browser information) expire when the session ends, within 7 days at
          the latest. Security and error logs are kept for at most 30 days and then deleted.
        </p>
      </Section>

      <Section title="7. Your Rights under Article 11 of the KVKK">
        <p>By applying to the data controller, you have the right to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>learn whether your personal data is processed;</li>
          <li>request information about it if it has been processed;</li>
          <li>learn the purpose of processing and whether it is used in line with that purpose;</li>
          <li>know the third parties in Turkey or abroad to whom it is transferred;</li>
          <li>request correction if it is incomplete or inaccurate;</li>
          <li>request its deletion or destruction under the conditions in Article 7 of the KVKK;</li>
          <li>request that correction, deletion or destruction be notified to third parties to whom the data was transferred;</li>
          <li>
            object to a result against you arising from the analysis of your data exclusively by automated systems;
          </li>
          <li>claim compensation for damage suffered due to unlawful processing.</li>
        </ul>
      </Section>

      <Section title="8. How to Apply">
        <p>
          You can send requests regarding your rights to{" "}
          <Suspense fallback={<b>…</b>}>
            <ContactEmail />
          </Suspense>
          . Your request will be concluded free of charge within 30 days at the latest, depending on its nature.
        </p>
      </Section>

      <p className="border-t border-border pt-4 text-sm text-muted">
        <Link href="/" className="hover:text-accent-ink">← Back to {SITE.name}</Link>
      </p>
    </article>
  );
}
