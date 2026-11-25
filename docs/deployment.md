# Deployment (edunivo.io VPS)

`https://edunivo.io` runs on a Hostinger VPS (Ubuntu, 187.77.136.175). **Pushing to `main` deploys it automatically**: the server checks GitHub every minute and ships new commits on its own, usually live 1–2 minutes after the push.

The Vercel deployment (`edu-nivo.vercel.app`) is separate and has its own database.

## How a deploy works

1. `edunivo-deploy.timer` runs `/var/www/edunivo/deploy.sh` every minute as the `edunivo` user.
2. If `main` has a new commit, it's built in its own folder, `releases/<commit>`. The live site keeps running meanwhile.
3. Only if the build succeeds does `current` switch to the new release and the app restart (a few seconds' gap).
4. If the new version fails its health check, the previous release is restored automatically.
5. The last 3 releases are kept. A commit that fails to build is skipped until a newer commit arrives.

GitHub access uses a **read-only deploy key** (repo **Settings → Deploy keys → "EduNivo VPS"**), so this keeps working if the repo is made private. Don't remove that key.

## Layout on the server

| Path | What it is |
| --- | --- |
| `/var/www/edunivo/current` | Symlink to the live release |
| `/var/www/edunivo/releases/` | Built releases (newest 3) |
| `/var/www/edunivo/shared/.env.local` | Production secrets — never in git |
| `/var/www/edunivo/shared/ecosystem.config.cjs` | pm2 process definition |
| `/var/www/edunivo/repo.git` | Bare clone the releases are built from |

Other services: **MongoDB 8.0** (local only, auth enabled, database `edunivo`; credentials in `/root/.mongo-credentials`), **Nginx** reverse proxy, **Let's Encrypt** HTTPS (auto-renews), **ufw** firewall (SSH/80/443 only). SSH is key-only.

## Useful commands (on the server, as root)

```sh
journalctl -u edunivo-deploy -n 30 --no-pager      # recent deploys and failures
sudo -u edunivo /var/www/edunivo/deploy.sh --force # redeploy now (also retries a failed commit)
sudo -u edunivo pm2 logs edunivo --lines 100       # app logs
sudo -u edunivo pm2 status                          # is the app up
```

**Roll back by hand:** point `current` at an older folder in `releases/`, then restart:

```sh
sudo -u edunivo ln -sfn /var/www/edunivo/releases/<older-commit> /var/www/edunivo/current
sudo -u edunivo pm2 restart edunivo
```

**Change a secret:** edit `/var/www/edunivo/shared/.env.local`, then `sudo -u edunivo pm2 restart edunivo --update-env`.

**Create a Super Admin from the command line** (normally done in the panel under Platform → Super Admins):

```sh
cd /var/www/edunivo/current && sudo -u edunivo SUPERADMIN_EMAIL=you@example.com SUPERADMIN_PASSWORD='...' node scripts/seed-superadmin.mjs
```
