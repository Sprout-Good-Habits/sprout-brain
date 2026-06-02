#!/usr/bin/env python3
"""Install Sprout Brain skills into local agent skill directories."""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path


SUPPORTED_TARGETS = ("codex", "claude")


def default_target_dir(target: str) -> Path:
    home = Path.home()
    if target == "codex":
        base = Path(os.environ.get("CODEX_HOME", home / ".codex"))
    elif target == "claude":
        base = Path(os.environ.get("CLAUDE_HOME", home / ".claude"))
    else:
        raise ValueError(f"Unsupported target: {target}")
    return base / "skills"


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[3]


def discover_skills(repo_root: Path) -> dict[str, Path]:
    skills_root = repo_root / "skills"
    discovered: dict[str, Path] = {}
    for skill_file in skills_root.rglob("SKILL.md"):
        skill_dir = skill_file.parent
        discovered[skill_dir.name] = skill_dir
    return dict(sorted(discovered.items()))


def parse_targets(raw_target: str) -> list[str]:
    if raw_target == "all":
        return list(SUPPORTED_TARGETS)
    if raw_target in SUPPORTED_TARGETS:
        return [raw_target]
    raise ValueError(f"Unsupported target: {raw_target}")


def parse_skill_selection(raw_skills: str, discovered: dict[str, Path]) -> list[str]:
    if raw_skills == "all":
        return list(discovered)
    requested = [item.strip() for item in raw_skills.split(",") if item.strip()]
    missing = [name for name in requested if name not in discovered]
    if missing:
        available = ", ".join(discovered) or "(none)"
        raise ValueError(
            f"Unknown skill(s): {', '.join(missing)}. Available skills: {available}"
        )
    return requested


def backup_existing(target_dir: Path) -> Path:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    backup = target_dir.with_name(f"{target_dir.name}.bak-{stamp}")
    counter = 1
    while backup.exists():
        backup = target_dir.with_name(f"{target_dir.name}.bak-{stamp}-{counter}")
        counter += 1
    target_dir.rename(backup)
    return backup


def install_skill(source_dir: Path, target_parent: Path, dry_run: bool) -> str:
    target_dir = target_parent / source_dir.name
    if dry_run:
        action = "update" if target_dir.exists() else "install"
        return f"DRY RUN: would {action} {source_dir.name} -> {target_dir}"

    target_parent.mkdir(parents=True, exist_ok=True)
    backup = None
    if target_dir.exists():
        backup = backup_existing(target_dir)

    temp_dir = target_parent / f".{source_dir.name}.tmp-install"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    shutil.copytree(source_dir, temp_dir, ignore=shutil.ignore_patterns("__pycache__"))
    temp_dir.rename(target_dir)

    if backup:
        return f"Updated {source_dir.name} -> {target_dir} (backup: {backup})"
    return f"Installed {source_dir.name} -> {target_dir}"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Install Sprout Brain skills for Codex and/or Claude Code."
    )
    parser.add_argument(
        "--target",
        choices=("codex", "claude", "all"),
        default="all",
        help="Install target. Defaults to all supported targets.",
    )
    parser.add_argument(
        "--skills",
        default="all",
        help="Comma-separated skill names to install, or 'all'. Defaults to all.",
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=repo_root_from_script(),
        help="Path to sprout-brain repo root.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned installs without changing files.",
    )
    return parser


def main(argv: list[str]) -> int:
    args = build_parser().parse_args(argv)
    repo_root = args.repo_root.resolve()
    discovered = discover_skills(repo_root)
    if not discovered:
        print(f"No skills found under {repo_root / 'skills'}", file=sys.stderr)
        return 1

    try:
        targets = parse_targets(args.target)
        selected = parse_skill_selection(args.skills, discovered)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    print(f"Repo: {repo_root}")
    print(f"Skills: {', '.join(selected)}")
    print(f"Targets: {', '.join(targets)}")

    for target in targets:
        target_parent = default_target_dir(target)
        print(f"\n[{target}] {target_parent}")
        for skill_name in selected:
            print(install_skill(discovered[skill_name], target_parent, args.dry_run))

    if not args.dry_run:
        print("\nRestart Codex or Claude Code sessions so skill metadata reloads.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
