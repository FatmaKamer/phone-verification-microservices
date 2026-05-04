#  Telefon Numarası Doğrulama Servisi

### Mikroservis Mimarisi ile Geliştirilmiş Web Uygulaması

Bu proje, **6 basamaklı telefon numaralarının belirli matematiksel
kurallara göre doğrulanması** ve **geçerli numaraların kullanıcı
bilgileriyle birlikte veritabanına kaydedilmesi** amacıyla
geliştirilmiş, **Docker tabanlı mikroservis mimarisine sahip** bir web
uygulamasıdır.

------------------------------------------------------------------------

## 1. Proje Özeti

Uygulama üç ana mikroservisten oluşmaktadır:

-   **Frontend Servisi (Nginx):** Kullanıcı arayüzünü sunar.\
-   **API Servisi (Node.js):** Telefon numarası doğrulama ve kayıt
    işlemlerini yönetir.\
-   **Veritabanı Servisi (MySQL):** Kayıtlı kullanıcı verilerini saklar.

Tüm servisler Docker Compose kullanılarak ayağa kaldırılır ve container
network üzerinden haberleşir.

------------------------------------------------------------------------

## 2. Mikroservis Mimarisi

Frontend (Nginx)\
↓\
API (Node.js)\
↓\
Database (MySQL)

------------------------------------------------------------------------

## 3. Proje Dizin Yapısı

    .
    ├── api
    │   ├── Dockerfile
    │   ├── package.json
    │   └── server.js
    │
    ├── frontend
    │   ├── Dockerfile
    │   ├── index.html
    │   ├── script.js
    │   └── style.css
    │
    ├── db
    │   └── veri_tabani_olustur.sql
    │
    ├── docker-compose.yml
    └── README.md
------------------------------------------------------------------------

## 4. Kullanılan Teknolojiler

-   Node.js
-   MySQL 8.0
-   Docker & Docker Compose
-   Nginx
-   HTML, CSS, JavaScript
------------------------------------------------------------------------

## 5. Telefon Numarası Doğrulama Kuralları

Telefon numarası **6 basamaklı** olmalı ve aşağıdaki koşulları
sağlamalıdır:

1.  En az bir rakam sıfırdan farklı olmalıdır\
2.  İlk üç basamağın toplamı, son üç basamağın toplamına eşit olmalıdır\
3.  Tek indeksli basamakların toplamı, çift indeksli basamakların
    toplamına eşit olmalıdır

Bu koşulları sağlayan numaralar **geçerli** kabul edilir.

------------------------------------------------------------------------

## 6. API Endpoint Örnekleri

### 6.1 POST /api/registration

#### A. Başarılı Kayıt (201 Created)

``` json
{
  "status": "accepted",
  "message": "201: Kayıt başarılı.",
  "data": {
    "id": 1,
    "name": "kamer",
    "surname": "durusoy",
    "email": "kamer@gmail.com",
    "phone": "054153"
  }
}
```

#### B. Geçersiz Numara (422 Unprocessable Entity)

``` json
{
  "status": "denied",
  "message": "422: Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.",
  "isValid": false
}
```

#### C. Aynı Numara ile Kayıt (409 Conflict)

``` json
{
  "status": "denied",
  "message": "409: Bu telefon zaten kayıtlı."
}
```

------------------------------------------------------------------------

## 7. Veri Modeli (telefon_numarasi)

Kullanıcı kayıtları `registrations` tablosunda tutulmaktadır.

  Alan Adı     Tip            Açıklama
  ------------ -------------- -------------------------------
  id           INT            Primary Key, AUTO_INCREMENT
  name         VARCHAR(100)   Kullanıcı adı
  surname      VARCHAR(100)   Kullanıcı soyadı
  email        VARCHAR(150)   Kullanıcı e-posta adresi
  phone        CHAR(6)        Benzersiz telefon numarası
  created_at   TIMESTAMP      Varsayılan: CURRENT_TIMESTAMP

 Telefon alanı **UNIQUE** kısıtı ile tanımlanmış olup tekrar eden
kayıtlar engellenmiştir.

------------------------------------------------------------------------

## 8. Docker ile Çalıştırma

### Gereksinimler

-   Docker
-   Docker Compose

### Çalıştırma

``` bash
docker-compose up --build
```

------------------------------------------------------------------------

## 9. Servis Erişim Bilgileri

-   Frontend: http://localhost:8080\
-   API: http://localhost:3000\
-   MySQL: localhost:3306

------------------------------------------------------------------------

## 10. Geliştirici Bilgileri

-   **Geliştirici:** Fatma Kamer Durusoy\
-   **Bölüm:** Yazılım Mühendisliği\
-   **Proje Türü:** Mikroservis Tabanlı Web Uygulaması\
-   **Amaç:** Docker, API tasarımı ve veritabanı entegrasyonu pratiği

------------------------------------------------------------------------

## 11. Sonuç ve Değerlendirme

Bu projede mikroservis mimarisi kullanılarak modüler, ölçeklenebilir ve
sürdürülebilir bir web uygulaması geliştirilmiştir. Docker tabanlı yapı
sayesinde servislerin bağımsız olarak çalışması sağlanmış,
frontend--backend--veritabanı entegrasyonu başarıyla
gerçekleştirilmiştir.
